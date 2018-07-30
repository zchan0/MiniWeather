//index.js
//获取应用实例
const app = getApp()

const WeatherNameMap = {
    '晴': 'sunny',
    '多云': 'cloudy',
    '大雨': 'heavyrain',
    '小雨': 'lightrain',
    '阴天': 'overcast',
    '雪': 'snow',
}

const WeatherColorMap = {
    'sunny': '#cbeefd',
    'cloudy': '#deeef6',
    'overcast': '#c6ced2',
    'lightrain': '#bdd5e1',
    'heavyrain': '#c5ccd0',
    'snow': '#aae1fc'
}

const WeekNameMap = {
  '1': '星期一',
  '2': '星期二',
  '3': '星期三',
  '4': '星期四',
  '5': '星期五',
  '6': '星期六',
  '7': '星期日'
}

Page({
  onLoad() {
    this.getNow()
  },
  onPullDownRefresh() {
    this.getNow(function () {
        wx.stopPullDownRefresh();
    })
  },
  // 获取当前的天气
  getNow(completeCallback) {
    const self = this
    wx.request({
      url: 'https://restapi.amap.com/v3/weather/weatherInfo',
      data: {
        key: '402e55b822b03e1280f11fa1b19bd98e',
        city: '110105', // 使用 adcode, 列表：https://webapi.amap.com/ui/1.0/ui/geo/DistrictExplorer/assets/d_v1/area_tree.txt
        extensions: 'all', // base/all，当日或者未来几天
        output: 'JSON'
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res)

        const resultData = res.data.forecasts[0]
        const forecasts = resultData.casts
        const location = resultData.city
        const province = resultData.province
        const reportTime = resultData.reporttime

        const convertedForecasts = constructForecasts(forecasts)
        const castForToday = convertedForecasts[0]
        console.log(castForToday);

        const timeNow = new Date()
        const currentTemp = isInDaylight(timeNow) ? castForToday.dayTemp: castForToday.nightTemp
        const weatherDesc = isInDaylight(timeNow) ? castForToday.dayWeather: castForToday.nightWeather
        const imageName = WeatherNameMap[weatherDesc];

        self.setData({
            temperature: currentTemp,
            weather: weatherDesc,
            imagePath: '/imgs/' + imageName + '-bg.png',
            iconPath: castForToday.icon,
            forecasts: convertedForecasts
        })
        wx.setNavigationBarColor({
            frontColor: '#000000',
            backgroundColor: WeatherColorMap[WeatherNameMap[weatherDesc]],
        })
      },
      complete: function () {
          completeCallback && completeCallback();
      }
    })
  }
})

function constructForecasts(forecasts) {
  let newForecasts = []
  let newForecast = {}
  forecasts.forEach(forecast => {
    newForecast = {}
    newForecast.week = WeekNameMap[forecast.week]
    newForecast.date = forecast.date.substring(5)
    newForecast.dayTemp = forecast.daytemp
    newForecast.nightTemp = forecast.nighttemp
    newForecast.weatherDesc = forecast.dayweather // 默认设置白天的天气为当天的天气
    newForecast.dayWeather = forecast.dayweather
    newForecast.nightWeather = forecast.nightweather
    newForecast.icon = '/imgs/' + WeatherNameMap[forecast.dayweather] + '-icon.png'
    newForecasts.push(newForecast)
  })
  return newForecasts
}

function isInDaylight(date) {
  const currentHours = date.getHours()
  if (currentHours >= 6 && currentHours <= 18) {
    return true
  }
  return false
}
