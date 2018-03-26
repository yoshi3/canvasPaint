class Util {
  static sum (ary) {
    let sum = 0, i = 0, ii = ary.length;
    for(; i < ii; i++){
      sum += ary[i];
    }
    return sum;
  };
  static average (arr, fn) {
    return this.sum(arr, fn)/arr.length;
  };
};

export default Util;