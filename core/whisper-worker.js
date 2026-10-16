/**
 * Whisper im Worker — damit die Oberfläche während der Transkription nicht einfriert.
 * Whisper in a worker, so the interface does not freeze while transcribing.
 *
 * Das Modell wird einmal geladen und danach von transformers.js im Cache Storage
 * des Browsers gehalten. Ab dann läuft alles ohne Netz.
 *
 * The model is fetched once and then kept in the browser's Cache Storage by
 * transformers.js. From then on everything runs without a network.
 */

const CDN = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3';

let pipelinePromise = null;
let loadedModel = null;
let lib = null;

async function getLib() {
  if (lib) return lib;
  lib = await import(/* @vite-ignore */ `${CDN}`);
  // Nur die gebündelten Dateien nutzen, nichts Lokales suchen.
  lib.env.allowLocalModels = false;
  lib.env.useBrowserCache = true;
  return lib;
}

async function getPipeline(model, onProgress) {
  if (pipelinePromise && loadedModel === model) return pipelinePromise;

  loadedModel = model;
  pipelinePromise = (async () => {
    const { pipeline } = await getLib();

    // WebGPU ist auf dem Telefon meist nicht verfügbar; dann still auf WASM zurück.
    const attempts = [
      { device: 'webgpu', dtype: 'fp16' },
      { device: 'wasm', dtype: 'q8' }
    ];

    let lastError;
    for (const opts of attempts) {
      try {
        return await pipeline('automatic-speech-recognition', model, {
          ...opts,
          progress_callback: onProgress
        });
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError;
  })();

  return pipelinePromise;
}

self.onmessage = async ev => {
  const { type, id, model, audio, language, task } = ev.data || {};

  try {
    if (type === 'warmup') {
      await getPipeline(model, p => self.postMessage({ type: 'progress', id, payload: p }));
      self.postMessage({ type: 'ready', id, model });
      return;
    }

    if (type === 'transcribe') {
      const transcriber = await getPipeline(
        model,
        p => self.postMessage({ type: 'progress', id, payload: p })
      );

      const duration = audio.length / 16000;

      const result = await transcriber(audio, {
        language: language || null,
        task: task || 'transcribe',
        // Lange Aufnahmen in überlappenden Fenstern — sonst schneidet Whisper bei 30 s ab.
        ...(duration > 28 ? { chunk_length_s: 30, stride_length_s: 5 } : {}),
        return_timestamps: false
      });

      const text = Array.isArray(result)
        ? result.map(r => r.text).join(' ').trim()
        : String(result?.text || '').trim();

      self.postMessage({ type: 'result', id, text });
      return;
    }

    if (type === 'dispose') {
      pipelinePromise = null;
      loadedModel = null;
      self.postMessage({ type: 'disposed', id });
      return;
    }
  } catch (err) {
    self.postMessage({
      type: 'error',
      id,
      message: err?.message || String(err)
    });
  }
};
