import bn from 'bignumber.js'
import { BigNumber, BigNumberish } from 'ethers'

bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 })

// returns the sqrt price as a 64x96
export function encodePriceSqrt(
  reserve1: BigNumberish,
  reserve0: BigNumberish,
): BigNumber {
  return BigNumber.from(
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy(new bn(2).pow(96)) // 1 * 2^96 -> SqrtPriceX96
      .integerValue(3) // 小さい方の整数に合わせる。
      .toString(),
  )
}
