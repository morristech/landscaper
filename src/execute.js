import {getExecutor} from './resolve'

export async function loadMods (mods, cache, emit) {
  const modMap = {}
  for (const mod of mods) {
    emit('mod/resolving', {mod})
    try {
      modMap[mod.id] = await getExecutor(mod.id, {cache})
    } catch (error) {
      emit('mod/not-found', {mod, error})
      throw error
    }
    emit('mod/resolved', {mod})
  }
  return modMap
}

export async function applyMods (directory, mods, modMap, emit) {
  for (const mod of mods) {
    const executor = modMap[mod.id]
    emit('mod/applying', {mod})
    try {
      await executor(directory, mod.options)
    } catch (error) {
      emit('mod/apply-failed', {mod, error})
      throw error
    }
    emit('mod/applied', {mod})
  }
}

export default async function execute ({directory, reporter, mods, cache}) {
  function emit (type, data) {
    data.type = type
    reporter.emit(type, data)
  }

  const modMap = await loadMods(mods, cache, emit)
  await applyMods(directory, mods, modMap, emit)
  emit('done', {directory, mods})
}