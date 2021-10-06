export type Move<T, N, M> = {
  time: T,
  parent: N,
  meta: M,
  child: N
}

export type LogMove<T, N, M> = {
  time: T,
  oldParent?: [N, M],
  newParent: N,
  meta: M,
  child: N
}

export type Tree<N, M> = Map<N, [N, M]>

export type State<T, N, M> = {
  log: LogMove<T, N, M>[],
  tree: Tree<N, M>
}

const getParent: <N, M>(tree: Tree<N, M>, child: N) => [N, M] | undefined = (tree, child) =>
  tree.get(child)

const ancester: <N, M>(tree: Tree<N, M>, parent: N, child: N) => boolean = (tree, parent, child) => {
  const p = tree.get(child)?.[0]

  if (p == undefined) {
    return false
  }

  if (p == parent) {
    return true
  }

  return ancester(tree, parent, p)
}

const doOp: <T, N, M>(move: Move<T, N, M>, tree: Tree<N, M>) => [LogMove<T, N, M>, Tree<N, M>] = (move, tree) => {
  const { time, parent: newParent, meta, child } = move
  const logMove = { time, oldParent: getParent(tree, child), newParent, meta, child }

  if (child == newParent || ancester(tree, child, newParent)) {
    return [logMove, tree]
  }

  const newTree = new Map(tree)
  newTree.delete(child)
  newTree.set(child, [newParent, meta])

  return [logMove, newTree]
}

const undoOp: <T, N, M>(logMove: LogMove<T, N, M>, tree: Tree<N, M>) => Tree<N, M> = (logMove, tree) => {
  const { oldParent, child } = logMove
  const newTree = new Map(tree)
  newTree.delete(child)

  if (oldParent) {
    const [oldP, oldM] = oldParent
    newTree.set(child, [oldP, oldM])
  }

  return newTree
}

const redoOp: <T, N, M>(logMove: LogMove<T, N, M>, state: State<T, N, M>) => State<T, N, M> = (logMove, state) => {
  const { time, newParent: parent, meta, child } = logMove
  const [newLogMove, tree] = doOp({ time, parent, meta, child }, state.tree)
  return { log: [newLogMove, ...state.log], tree }
}

export const applyOp: <T, N, M> (move: Move<T, N, M>, state: State<T, N, M>) => State<T, N, M> = (move, state) => {
  if (state.log.length == 0) {
    const [newLogMove, tree] = doOp(move, state.tree)
    return { log: [newLogMove], tree }
  } else {
    const [logMove, ...log] = state.log
    if (move.time < logMove.time) {
      return redoOp(logMove, applyOp(move, { log, tree: undoOp(logMove, state.tree) }))
    } else {
      const [logMove2, tree] = doOp(move, state.tree)
      return { log: [logMove2, logMove, ...log], tree }
    }
  }
}

export const applyOps: <T, N, M>(moves: Move<T, N, M>[]) => State<T, N, M> = moves => {
  let state = { log: [], tree: new Map() }
  for (const move of moves) {
    state = applyOp(move, state)
  }
  return state
}

export const unique_parent: <M, N>(tree: Tree<M, N>) => boolean = () =>
  true // trees are unique Maps

export const acyclic: <M, N>(tree: Tree<M, N>) => boolean = tree =>
  ![...tree.keys()].some(child => ancester(tree, child, child))
