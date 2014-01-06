if typeof window=='object' then {require, exports, module} = twoside('/test/mocha/samples/testarithmatic')
do (require=require, exports=exports, module=module) ->

  chai = require 'chai'
  expect = chai.expect

  {parse, parse1} = arithmatic = require '../../../samples/arithmatic'

  describe "run samples/testarithmatic:", ->
    it '', ->

  describe "arithmatic", ->
    it "parse 1", ->
      expect(parse('1')).to.equal '1'
    it "parse 1+1", ->
      expect(parse('1+1')).to.equal '1+1'
    it "parse 1+1*1", ->
      expect(parse('1+1*1')).to.equal '1+1*1'
    it "parse 1*1+1", ->
      expect(parse('1*1+1')).to.equal '1*1+1'
    it "parse 1*1", ->
      expect(parse('1*1')).to.equal '1*1'
    it "parse 1*1*1", ->
      expect(parse('1*1*1')).to.equal '1*1*1'
    it "parse (1*1)", ->
      expect(parse('(1*1)')).to.equal '(1*1)'
    it "parse (1*1)", ->
      expect(parse('(1*1)')).to.equal '(1*1)'
    it "parse a=1", ->
      expect(parse('a=1')).to.equal 'a=1'
    it.only "parse a  = 1", ->
      expect(parse('a  = 1')).to.equal 'a=1'
    it.only "parse a  = b = 1", ->
      expect(parse('a  = b = 1')).to.equal 'a=b=1'


    it "parse1 1", ->
      expect(parse1('1')).to.equal '1'
      expect(parse1('3')).to.equal '3'
      expect(parse1('2')).to.equal undefined
