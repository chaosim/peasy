from nose.tools import eq_, ok_, assert_raises
from peasy import initialize, char, memo, addRecursiveCircles, computeLeftRecursives, parse
import peasy as p

a = char('a'); b = char('b'); x = char('x')

memoA = memo('A')

def parse1(text):
  class Rules:
    rootSymbol = 'A'
    parentToChildren = {}
    def A(self, start):
      m = memoA(start)
      return m and x(p.cur()) and m+'x' or m or a(start)
  rules = Rules()
  initialize(rules)
  addRecursiveCircles(rules, ['A'])
  computeLeftRecursives(rules)
  return parse(text, rules)

def parse2(text):
  class Rules:
    rootSymbol = 'A'
    def A(self, start):
      m =  rules.B(start)
      return m and x(p.cur()) and m+'x' or m or a(start)
    def B(self, start): return memoA(start) or b(start)
  rules = Rules()
  initialize(rules)
  addRecursiveCircles(rules, ['A', 'B'])
  computeLeftRecursives(rules)
  return parse(text,  rules)

def parse3(text):  
  class Rules:
    rootSymbol = 'A'
    def A(self, start):
      m =  rules.B(start)
      return m and x(p.cur()) and m+'x' or m\
      or a(start)
    def B(self, start): return rules.C(start)
    def C(self, start): return memoA(start) or b(start)
  rules = Rules()
  initialize(rules)
  addRecursiveCircles(rules, ['A', 'B', 'C'])
  computeLeftRecursives(rules)
  return parse(text, rules)

class Test:
  def test1(self):
    "self A: Ax|a"
    parse = parse1
    eq_(parse('a'), 'a')
    eq_(parse('ax'), 'ax')
    eq_(parse('axx'), 'axx')
    eq_(parse('axxx'), 'axxx')
    

class Test2:
  def test1(self):
    "self A: Bx|a; B:A|b"
    parse = parse2
    eq_(parse('a'), 'a')
    eq_(parse('ax'), 'ax')
    eq_(parse('axx'), 'axx')
    eq_(parse('axxx'), 'axxx')
    eq_(parse('b'), 'b')
    eq_(parse('bx'), 'bx')
    eq_(parse('bxxx'), 'bxxx')
    eq_(parse('bxg'), 'bx')
    eq_(parse('bxxg'), 'bxx')
    eq_(parse('bxxxg'), 'bxxx')
    eq_(parse('fg'), None)
    eq_(parse(''), None)
    

class Test3:
  def test1(self):
    "self A: Bx|a; B:C; C:A|b"
    parse = parse3
    eq_(parse('a'), 'a')
    eq_(parse('ax'), 'ax')
    eq_(parse('axx'), 'axx')
    eq_(parse('axxx'), 'axxx')
    eq_(parse('b'), 'b')
    eq_(parse('bx'), 'bx')
    eq_(parse('bxxx'), 'bxxx')
    eq_(parse('bxg'), 'bx')
    eq_(parse('bxxg'), 'bxx')
    eq_(parse('bxxxg'), 'bxxx')
    eq_(parse('fg'), None)
    eq_(parse(''), None)
    
