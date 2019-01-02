/*
*
*
*       FILL IN EACH UNIT TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]----
*       (if additional are added, keep them at the very end!)
*/

const chai = require('chai');
const assert = chai.assert;
const ConvertHandler = require('../controllers/convertHandler.js');

const convertHandler = new ConvertHandler();

suite('Unit Tests', function(){

  suite('Function convertHandler.getNum(input)', function() {

    test('Whole number input', function(done) {
      const input = '32L';
      assert.equal(convertHandler.getNum(input), 32);
      done();
    });

    test('Decimal Input', function(done) {
      const input = '3.2kg';
      assert.equal(convertHandler.getNum(input), 3.2);
      done();
    });

    test('Fractional Input', function(done) {
      const input = '23/8L';
      assert.equal(convertHandler.getNum(input), '2.875');
      done();
    });

    test('Fractional Input w/ Decimal', function(done) {
      const input = '23.1/8L';
      assert.equal(convertHandler.getNum(input), '2.8875');
      done();
    });

    test('Invalid Input (double fraction)', function(done) {
      const input = '2/2/3/3';
      assert.equal(convertHandler.getNum(input), 'invalid number');
      done();
    });

    test('No Numerical Input', function(done) {
      const input = 'non_numerical_input';
      assert.equal(convertHandler.getNum(input), 1);
      done();
    });

  });

  suite('Function convertHandler.getUnit(input)', function() {

    test('For Each Valid Unit Inputs', function(done) {
      const validUnits = ['gal','l','mi','km','lbs','kg','GAL','L','MI','KM','LBS','KG'];
      validUnits.forEach(function(ele) {
        let input = '20' + ele;
        assert.equal(convertHandler.getUnit(input), ele);
      });
      done();
    });

    test('Unknown Unit Input', function(done) {
      const input = '29Gal';
      assert.equal(convertHandler.getUnit(input), 'invalid unit')
      done();
    });

  });

  suite('Function convertHandler.getReturnUnit(initUnit)', function() {

    test('For Each Valid Unit Inputs', function(done) {
      const input = ['gal','l','mi','km','lbs','kg'];
      const expect = ['l','gal','km','mi','kg','lbs'];
      input.forEach(function(ele, i) {
        assert.equal(convertHandler.getReturnUnit(ele), expect[i]);
      });
      done();
    });

  });

  suite('Function convertHandler.spellOutUnit(unit)', function() {

    test('For Each Valid Unit Inputs', function(done) {
      const input = ['gal', 'l', 'mi', 'km', 'lbs', 'kg'];
      const expect = ['gallon', 'liter', 'mile', 'kilometer', 'pound', 'kilogram'];
      input.forEach(function(ele, i) {
        assert.equal(convertHandler.spellOutUnit(ele), expect[i]);
      });
      done();
    });

  });

  suite('Function convertHandler.convert(num, unit)', function() {

    test('Gal to L', function(done) {
      const input = [5, 'gal'];
      const expected = 18.92705;
      assert.approximately(convertHandler.convert(input[0],input[1]), expected, 0.1); //0.1 tolerance
      done();
    });

    test('L to Gal', function(done) {
      const input = [10, 'l'];
      const expected = 2.64172;
      assert.approximately(convertHandler.convert(input[0], input[1]), expected, 0.1);
      done();
    });

    test('Mi to Km', function(done) {
      const input = [165.3, 'mi'];
      const expected = 266.02390;
      assert.approximately(convertHandler.convert(input[0], input[1]), expected, 0.1);
      done();
    });

    test('Km to Mi', function(done) {
      const input = [54.4/2, 'km'];
      const expected = 16.90134;
      assert.approximately(convertHandler.convert(input[0], input[1]), expected, 0.1);
      done();
    });

    test('Lbs to Kg', function(done) {
      const input = [43.6, 'lbs'];
      const expected = 19.77663;
      assert.approximately(convertHandler.convert(input[0], input[1]), expected, 0.1);
      done();
    });

    test('Kg to Lbs', function(done) {
      const input = [12, 'kg'];
      const expected = 26.4555;
      assert.approximately(convertHandler.convert(input[0], input[1]), expected, 0.1);
      done();
    });

  });

});
