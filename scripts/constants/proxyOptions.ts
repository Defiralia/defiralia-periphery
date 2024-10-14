import { DeployProxyOptions } from '@openzeppelin/hardhat-upgrades/dist/utils'

export const proxyOptions: DeployProxyOptions = {
  kind: 'uups',
  unsafeAllow: ['external-library-linking'],
}
