/**
 * 阿里云节点配置
 * 使用真实的阿里云OSS节点地址进行测速
 */

export const ALIYUN_NODES = [
  {
    id: 'cn-qingdao',
    name: '阿里云青岛',
    region: '华北',
    country: '中国',
    city: '青岛',
    lat: 36.067,
    lng: 120.383,
    ip: '47.104.38.82',
    ossHost: 'oss-cn-qingdao.aliyuncs.com',
    url: 'http://47.104.38.82'
  },
  {
    id: 'cn-beijing',
    name: '阿里云北京',
    region: '华北',
    country: '中国',
    city: '北京',
    lat: 39.904,
    lng: 116.407,
    ip: '59.110.190.69',
    ossHost: 'oss-cn-beijing.aliyuncs.com',
    url: 'http://59.110.190.69'
  },
  {
    id: 'cn-zhangjiakou',
    name: '阿里云张家口',
    region: '华北',
    country: '中国',
    city: '张家口',
    lat: 40.769,
    lng: 114.886,
    ip: '47.92.17.61',
    ossHost: 'oss-cn-zhangjiakou.aliyuncs.com',
    url: 'http://47.92.17.61'
  },
  {
    id: 'cn-huhehaote',
    name: '阿里云呼和浩特',
    region: '华北',
    country: '中国',
    city: '呼和浩特',
    lat: 40.842,
    lng: 111.749,
    ip: '39.104.9.1',
    ossHost: 'oss-cn-huhehaote.aliyuncs.com',
    url: 'http://39.104.9.1'
  },
  {
    id: 'cn-wulanchabu',
    name: '阿里云乌兰察布',
    region: '华北',
    country: '中国',
    city: '乌兰察布',
    lat: 40.994,
    lng: 113.135,
    ip: '39.101.35.62',
    ossHost: 'oss-cn-wulanchabu.aliyuncs.com',
    url: 'http://39.101.35.62'
  },
  {
    id: 'cn-hangzhou',
    name: '阿里云杭州',
    region: '华东',
    country: '中国',
    city: '杭州',
    lat: 30.274,
    lng: 120.155,
    ip: '118.31.219.171',
    ossHost: 'oss-cn-hangzhou.aliyuncs.com',
    url: 'http://118.31.219.171'
  },
  {
    id: 'cn-shanghai',
    name: '阿里云上海',
    region: '华东',
    country: '中国',
    city: '上海',
    lat: 31.230,
    lng: 121.473,
    ip: '106.14.228.194',
    ossHost: 'oss-cn-shanghai.aliyuncs.com',
    url: 'http://106.14.228.194'
  },
  {
    id: 'cn-shenzhen',
    name: '阿里云深圳',
    region: '华南',
    country: '中国',
    city: '深圳',
    lat: 22.543,
    lng: 114.057,
    ip: '120.77.166.226',
    ossHost: 'oss-cn-shenzhen.aliyuncs.com',
    url: 'http://120.77.166.226'
  },
  {
    id: 'cn-heyuan',
    name: '阿里云河源',
    region: '华南',
    country: '中国',
    city: '河源',
    lat: 23.746,
    lng: 114.697,
    ip: '47.113.155.0',
    ossHost: 'oss-cn-heyuan.aliyuncs.com',
    url: 'http://47.113.155.0'
  },
  {
    id: 'cn-guangzhou',
    name: '阿里云广州',
    region: '华南',
    country: '中国',
    city: '广州',
    lat: 23.129,
    lng: 113.264,
    ip: '8.134.16.0',
    ossHost: 'oss-cn-guangzhou.aliyuncs.com',
    url: 'http://8.134.16.0'
  },
  {
    id: 'cn-chengdu',
    name: '阿里云成都',
    region: '西南',
    country: '中国',
    city: '成都',
    lat: 30.572,
    lng: 104.066,
    ip: '47.108.5.136',
    ossHost: 'oss-cn-chengdu.aliyuncs.com',
    url: 'http://47.108.5.136'
  },
  {
    id: 'cn-nanjing',
    name: '阿里云南京',
    region: '华东',
    country: '中国',
    city: '南京',
    lat: 32.060,
    lng: 118.796,
    ip: '47.122.12.0',
    ossHost: 'oss-cn-nanjing.aliyuncs.com',
    url: 'http://47.122.12.0'
  },
  {
    id: 'cn-hongkong',
    name: '阿里云香港',
    region: '港澳台',
    country: '中国',
    city: '香港',
    lat: 22.319,
    lng: 114.169,
    ip: '47.75.18.13',
    ossHost: 'oss-cn-hongkong.aliyuncs.com',
    url: 'http://47.75.18.13'
  },
  {
    id: 'us-west-1',
    name: '阿里云硅谷',
    region: '北美',
    country: '美国',
    city: '硅谷',
    lat: 37.387,
    lng: -122.082,
    ip: '47.88.73.1',
    ossHost: 'oss-us-west-1.aliyuncs.com',
    url: 'http://47.88.73.1'
  },
  {
    id: 'us-east-1',
    name: '阿里云弗吉尼亚',
    region: '北美',
    country: '美国',
    city: '弗吉尼亚',
    lat: 39.043,
    lng: -77.487,
    ip: '47.252.95.42',
    ossHost: 'oss-us-east-1.aliyuncs.com',
    url: 'http://47.252.95.42'
  },
  {
    id: 'ap-southeast-1',
    name: '阿里云新加坡',
    region: '亚太',
    country: '新加坡',
    city: '新加坡',
    lat: 1.352,
    lng: 103.819,
    ip: '47.74.196.40',
    ossHost: 'oss-ap-southeast-1.aliyuncs.com',
    url: 'http://47.74.196.40'
  },
  {
    id: 'ap-southeast-2',
    name: '阿里云悉尼',
    region: '亚太',
    country: '澳大利亚',
    city: '悉尼',
    lat: -33.868,
    lng: 151.209,
    ip: '47.91.39.21',
    ossHost: 'oss-ap-southeast-2.aliyuncs.com',
    url: 'http://47.91.39.21'
  },
  {
    id: 'ap-southeast-3',
    name: '阿里云吉隆坡',
    region: '亚太',
    country: '马来西亚',
    city: '吉隆坡',
    lat: 3.139,
    lng: 101.686,
    ip: '47.254.218.88',
    ossHost: 'oss-ap-southeast-3.aliyuncs.com',
    url: 'http://47.254.218.88'
  },
  {
    id: 'ap-southeast-5',
    name: '阿里云雅加达',
    region: '亚太',
    country: '印度尼西亚',
    city: '雅加达',
    lat: -6.208,
    lng: 106.845,
    ip: '149.129.200.96',
    ossHost: 'oss-ap-southeast-5.aliyuncs.com',
    url: 'http://149.129.200.96'
  },
  {
    id: 'ap-south-1',
    name: '阿里云孟买',
    region: '亚太',
    country: '印度',
    city: '孟买',
    lat: 19.076,
    lng: 72.877,
    ip: '149.129.143.101',
    ossHost: 'oss-ap-south-1.aliyuncs.com',
    url: 'http://149.129.143.101'
  },
  {
    id: 'ap-northeast-1',
    name: '阿里云东京',
    region: '亚太',
    country: '日本',
    city: '东京',
    lat: 35.689,
    lng: 139.691,
    ip: '47.91.8.42',
    ossHost: 'oss-ap-northeast-1.aliyuncs.com',
    url: 'http://47.91.8.42'
  },
  {
    id: 'eu-central-1',
    name: '阿里云法兰克福',
    region: '欧洲',
    country: '德国',
    city: '法兰克福',
    lat: 50.110,
    lng: 8.682,
    ip: '47.254.186.9',
    ossHost: 'oss-eu-central-1.aliyuncs.com',
    url: 'http://47.254.186.9'
  },
  {
    id: 'eu-west-1',
    name: '阿里云伦敦',
    region: '欧洲',
    country: '英国',
    city: '伦敦',
    lat: 51.507,
    lng: -0.127,
    ip: '8.208.40.20',
    ossHost: 'oss-eu-west-1.aliyuncs.com',
    url: 'http://8.208.40.20'
  },
  {
    id: 'me-east-1',
    name: '阿里云迪拜',
    region: '中东',
    country: '阿联酋',
    city: '迪拜',
    lat: 25.204,
    lng: 55.270,
    ip: '47.91.99.127',
    ossHost: 'oss-me-east-1.aliyuncs.com',
    url: 'http://47.91.99.127'
  }
]

// 测速配置
export const SPEED_TEST_CONFIG = {
  timeout: 5000,
  measureCount: 3,
  maxRetries: 2,
  retryDelay: 1000,
  maxConcurrent: 5
}

/**
 * 获取所有节点
 */
export function getAllNodes() {
  return ALIYUN_NODES
}

/**
 * 根据地区获取节点
 */
export function getNodesByRegion(region) {
  return ALIYUN_NODES.filter(n => n.region === region)
}

/**
 * 根据国家获取节点
 */
export function getNodesByCountry(country) {
  return ALIYUN_NODES.filter(n => n.country === country)
}

/**
 * 根据ID获取节点
 */
export function getNodeById(id) {
  return ALIYUN_NODES.find(n => n.id === id)
}

/**
 * 获取所有地区
 */
export function getAllRegions() {
  return [...new Set(ALIYUN_NODES.map(n => n.region))]
}

/**
 * 获取所有国家
 */
export function getAllCountries() {
  return [...new Set(ALIYUN_NODES.map(n => n.country))]
}