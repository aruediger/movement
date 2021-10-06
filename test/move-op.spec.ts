import { acyclic, applyOps, Move } from '../src'


const ops: (n: number) => Move<number, number, number>[] = n => {
  const ret = []
  for (let i = 0; i < n; i++) {
    ret.push({
      time: i,
      parent: Math.round(Math.random() * n),
      child: Math.round(Math.random() * n),
      meta: undefined
    })
  }
  return ret
}

describe('move operations', () => {
  test('should converge', () => {
    for (let _ = 0; _ < 10; _++) {
      const operations = ops(100)
      const expected = applyOps(operations)
      expect(acyclic(expected.tree)).toBeTruthy()
      for (let i = 0; i < 10; i++) {
        const shuffled = [...operations].sort(() => Math.random() - 0.5)
        const actual = applyOps(shuffled)
        expect(actual).toEqual(expected)
      }
    }
  })
})
