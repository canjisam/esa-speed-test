// 模拟 ESA 全球节点数据
export const mockNodes = [
  // 亚太地区
  {
    id: 'ap-east-1',
    name: '亚太-香港',
    region: '亚太',
    country: '中国香港',
    lat: 22.3193,
    lng: 114.1694,
    status: 'online',
    latency: 45,
    load: 35
  },
  {
    id: 'ap-southeast-1',
    name: '亚太-新加坡',
    region: '亚太',
    country: '新加坡',
    lat: 1.3521,
    lng: 103.8198,
    status: 'online',
    latency: 68,
    load: 42
  },
  {
    id: 'ap-northeast-1',
    name: '亚太-东京',
    region: '亚太',
    country: '日本',
    lat: 35.6762,
    lng: 139.6503,
    status: 'online',
    latency: 52,
    load: 38
  },
  {
    id: 'ap-south-1',
    name: '亚太-孟买',
    region: '亚太',
    country: '印度',
    lat: 19.0760,
    lng: 72.8777,
    status: 'congested',
    latency: 180,
    load: 85
  },
  {
    id: 'ap-southeast-2',
    name: '亚太-悉尼',
    region: '亚太',
    country: '澳大利亚',
    lat: -33.8688,
    lng: 151.2093,
    status: 'online',
    latency: 125,
    load: 45
  },
  {
    id: 'ap-east-2',
    name: '亚太-上海',
    region: '亚太',
    country: '中国',
    lat: 31.2304,
    lng: 121.4737,
    status: 'online',
    latency: 28,
    load: 55
  },

  // 北美地区
  {
    id: 'us-west-1',
    name: '北美-洛杉矶',
    region: '北美',
    country: '美国',
    lat: 34.0522,
    lng: -118.2437,
    status: 'online',
    latency: 145,
    load: 62
  },
  {
    id: 'us-west-2',
    name: '北美-西雅图',
    region: '北美',
    country: '美国',
    lat: 47.6062,
    lng: -122.3321,
    status: 'online',
    latency: 158,
    load: 48
  },
  {
    id: 'us-east-1',
    name: '北美-纽约',
    region: '北美',
    country: '美国',
    lat: 40.7128,
    lng: -74.0060,
    status: 'congested',
    latency: 210,
    load: 78
  },
  {
    id: 'us-east-2',
    name: '北美-华盛顿',
    region: '北美',
    country: '美国',
    lat: 38.9072,
    lng: -77.0369,
    status: 'online',
    latency: 195,
    load: 52
  },
  {
    id: 'ca-central-1',
    name: '北美-多伦多',
    region: '北美',
    country: '加拿大',
    lat: 43.6532,
    lng: -79.3832,
    status: 'online',
    latency: 185,
    load: 40
  },

  // 欧洲地区
  {
    id: 'eu-west-1',
    name: '欧洲-伦敦',
    region: '欧洲',
    country: '英国',
    lat: 51.5074,
    lng: -0.1278,
    status: 'online',
    latency: 168,
    load: 55
  },
  {
    id: 'eu-central-1',
    name: '欧洲-法兰克福',
    region: '欧洲',
    country: '德国',
    lat: 50.1109,
    lng: 8.6821,
    status: 'online',
    latency: 175,
    load: 48
  },
  {
    id: 'eu-west-2',
    name: '欧洲-巴黎',
    region: '欧洲',
    country: '法国',
    lat: 48.8566,
    lng: 2.3522,
    status: 'online',
    latency: 172,
    load: 52
  },
  {
    id: 'eu-north-1',
    name: '欧洲-斯德哥尔摩',
    region: '欧洲',
    country: '瑞典',
    lat: 59.3293,
    lng: 18.0686,
    status: 'online',
    latency: 188,
    load: 35
  },
  {
    id: 'eu-south-1',
    name: '欧洲-米兰',
    region: '欧洲',
    country: '意大利',
    lat: 45.4642,
    lng: 9.1900,
    status: 'offline',
    latency: 0,
    load: 0
  },

  // 其他地区
  {
    id: 'sa-east-1',
    name: '南美-圣保罗',
    region: '南美',
    country: '巴西',
    lat: -23.5505,
    lng: -46.6333,
    status: 'online',
    latency: 285,
    load: 42
  },
  {
    id: 'me-south-1',
    name: '中东-迪拜',
    region: '中东',
    country: '阿联酋',
    lat: 25.2048,
    lng: 55.2708,
    status: 'online',
    latency: 195,
    load: 38
  },
  {
    id: 'af-south-1',
    name: '非洲-开普敦',
    region: '非洲',
    country: '南非',
    lat: -33.9249,
    lng: 18.4241,
    status: 'congested',
    latency: 320,
    load: 72
  }
]