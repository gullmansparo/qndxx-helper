import plugin from '../../lib/plugins/plugin.js'
import { User, segment } from "icqq"
import schedule from "node-schedule"
import common from "../../lib/common/common.js"
import puppeteer from '../../lib/puppeteer/puppeteer.js'
import axios from "axios"

/* Cron表达式每一位所代表的意思 *-代表任意值 ？-不指定值，仅日期和星期域支持该字符。
    *  *  *  *  *  *
    ┬  ┬  ┬  ┬  ┬  ┬
    │  │  │  │  │  |
    │  │  │  │  │  └ 星期几，取值：0 - 7，其中 0 和 7 都表示是周日
    │  │  │  │  └─── 月份，取值：1 - 12
    │  │  │  └────── 日期，取值：1 - 31
    │  │  └───────── 时，取值：0 - 23
    │  └──────────── 分，取值：0 - 59
    └─────────────── 秒，取值：0 - 59（可选）
*/
const LearningTime = "0 30 12 * * 1"
/* openid列表,是用于存放openid的字典，键为QQ号,值为对应用户的openid,示例如下，真实使用时请自行更改：
  const OpenidList = {
    "123456789": "1qazxsw23edcvfr45tgbnhy67ujmk",
    "987654321": "45tgbnhy67ujmk1qazxsw23edcvfr",
  }  // openid
*/
const OpenidList = {
}  // openid
const headers1 = {
    "Cookie": "JSESSIONID=4683D9BF9B19DF4CC7127F4F202522DD",
    "Origin": "http://qndxx.youth54.cn",
    "Accept": "*/*",
    "X-Requested-With": "XMLHttpRequest",
    "Connection": "keep-alive",
    "Referer": "http://qndxx.youth54.cn/SmartLA/dxx.w?method=enterIndexPage&fxopenid=&fxversion=",
    "User-Agent": "Mozilla/5.0 (Linux; Android 12; ELS-AN00 Build/HUAWEIELS-AN00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/4365 MMWEBSDK/20221012 Mobile Safari/537.36 MMWEBID/6920 MicroMessenger/8.0.30.2260(0x28001E55) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64",
    "Host": "qndxx.youth54.cn",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "zh-CN,zh;q=0.9,en-CN;q=0.8,en-US;q=0.7,en;q=0.6",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
}
const headers2 = {
    "Cookie": "JSESSIONID=848831515EF86803C960EF6E484AF695",
    "Origin": "http://qndxx.youth54.cn",
    "Accept": "*/*",
    "X-Requested-With": "XMLHttpRequest",
    "User-Agent": "Mozilla/5.0 (Linux; Android 12; ELS-AN00 Build/HUAWEIELS-AN00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/4365 MMWEBSDK/20221012 Mobile Safari/537.36 MMWEBID/6920 MicroMessenger/8.0.30.2260(0x28001E55) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64",
    "Referer": "http://qndxx.youth54.cn/SmartLA/dxx.w?method=enterIndexPage&fxopenid=&fxversion=",
    "Connection": "close",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Site": "same-origin",
    "Host": "qndxx.youth54.cn",
    "Accept-Encoding": "gzip, deflate",
    "Dnt": "1",
    "Sec-Fetch-Mode": "cors",
    "Te": "trailers",
    "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
}


export class YouthStudy extends plugin {
    constructor () {
        super({
            /** 功能名称 */
            name: '青年大学习助手',
            /** 功能描述 */
            dsc: '自动完成青年大学习，并截取学习记录',
            /** https://oicqjs.github.io/oicq/#events */
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 1000,
            rule: [
                {
                    /** 命令正则匹配 */
                    reg: '^#?青年大学习$',
                    /** 执行方法 */
                    fnc: 'youthStudy'
                },
                {
                    /** 命令正则匹配 */
                    reg: '^#?\\d{4}学习记录$',
                    /** 执行方法 */
                    fnc: 'recordScreenshot'
                }
            ]
        });
    }

    async youthStudy(){
        if(OpenidList[(this.e.user_id).toString()]){
            await YouthLearning(this.e, OpenidList[(this.e.user_id).toString()])
        }
        else{
            await this.e.reply('你还未录入openid')
        }
    }

    async recordScreenshot(){
        if(OpenidList[(this.e.user_id).toString()]){
            let year = Number(this.e.msg.replace('#','').replace('学习记录',''))
            let PersonStudyRecord = await queryPersonStudyRecord(OpenidList[(this.e.user_id).toString()], year)
            if(PersonStudyRecord['data']['vds'] == false){
                await this.e.reply('记录不存在')
                return true
            }
            await sendScreenshot(this.e, OpenidList[(this.e.user_id).toString()], year)
        }
        else{
            await this.e.reply('你还未录入openid')
        }
    }
}

/* 定时完成青年大学习 */
function AutoLearning() {
    schedule.scheduleJob(LearningTime, () => {
        let qq = Object.keys(OpenidList)
        let openid = Object.values(OpenidList)
        for (let i = 0; i < openid.length; i++) {
            let user = Bot.pickUser(Number(qq[i]))
            try{
                YouthLearning(user, openid[i])
            }
            catch (err){
                user.reply(err)
            }
            common.sleep(3000)
        }
    });
}

async function queryPersonStudyRecord(OPENID, year=0){
    let data = {
        "openid" : OPENID,
        "year" : year
    }
    let PersonStudyRecord = await axios.post('http://qndxx.youth54.cn/SmartLA/dxxjfgl.w?method=queryPersonStudyRecord',
    !year ? { "openid" : OPENID } : data, {
        headers: headers1,
        transformResponse: [function (data) {
            // 对接收的data的编码方式由gbk转换为utf-8
            data = new Uint8Array(data);
            data =JSON.parse((new TextDecoder('gbk').decode(data)).toString())
            return data;
        }],
        responseType: 'arraybuffer'
    })
    return PersonStudyRecord
}

async function reply(e, msg){
    if (e instanceof User) {
        await e.sendMsg(msg)
    } else {
        await e.reply(msg)
    }
}

function sleep(ms) {
    return new Promise(resolve =>setTimeout(() =>resolve(), ms))
}

async function sendScreenshot(e, OPENID, year=0){
    const browser = await puppeteer.browserInit()
    const page = await browser.newPage()
    await page.emulate({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Mobile/15E148 Safari/604.1',
        viewport: {
            width: 414,
            height: 828,
            deviceScaleFactor: 2,
            isMobile: true,
            hasTouch: true,
            isLandscape: false,
        },
    });
    await page.goto('http://qndxx.youth54.cn/SmartLA/dxxjfgl.w?method=getNewestVersionInfo')
    await page.evaluate((OPENID)=> {
        localStorage.setItem("openid",OPENID);
    })
    await page.goto('http://qndxx.youth54.cn/SmartLA/dxx.w?method=enterIndexPage&fxopenid=&fxversion=')
    let element_my = await page.$x('//*[@id="main"]/div[1]/div[2]/div[3]')
    await element_my[0].click()
    // 启用请求拦截器
    await page.setRequestInterception(true);
    page.on('request', interceptedRequest => {
        if (interceptedRequest.url().endsWith('method=queryPersonStudyRecord')){
            let overrides ={
                postData:'openid=' + OPENID + (!year ? '' : ('&year='+year)),
            }
            interceptedRequest.continue(overrides)
        }
        else
            interceptedRequest.continue()
    });
    let element_xxjl = await page.$x('//*[@id="my"]/div[1]/div[2]/div[1]')
    await element_xxjl[0].click()
    if(year){
        await page.waitForSelector('#chooseyear');
        await page.select('#chooseyear',year.toString())
    }
    await sleep(3000)
    let buff = await page.screenshot({type: 'png'})
    page.close().catch((err) => logger.error(err))
    //发送截图
    await reply(e,segment.image(buff))
}

/* 进行青年大学习，截取学习记录 */
async function YouthLearning(e, OPENID) {
    // 获取最新一期信息
    let NewestVersionInfo = await axios.get('http://qndxx.youth54.cn/SmartLA/dxxjfgl.w?method=getNewestVersionInfo',{
        transformResponse: [function (data) {
            // 对接收的data的编码方式由gbk转换为utf-8
            data = new Uint8Array(data)
            data =JSON.parse((new TextDecoder('gbk').decode(data)).toString())
            return data
        }],
        responseType: 'arraybuffer'
    })
    let NewestInfo = NewestVersionInfo['data']
    // 获取学习记录
   let PersonStudyRecord = await queryPersonStudyRecord(OPENID);
    if(PersonStudyRecord['data']['vds'] == false){
        PersonStudyRecord = await  queryPersonStudyRecord(OPENID, PersonStudyRecord['data']['nfds'][-2]['value'])
    }
    let NewestRecord = PersonStudyRecord['data']['vds'][0]
    if(NewestInfo['version'] !== NewestRecord['version']){
        await reply(e,'最新一期青年大学习来啦！正在认真学习中... ...')
        try{
            let response = await axios.post('http://qndxx.youth54.cn/SmartLA/dxxjfgl.w?method=studyLatest', {
                "openid": OPENID,
                'version': NewestInfo['version']}, {
                headers:headers2
            });
           if(response.status !== 200 || response['data']['errcode'] !== '0'){
               await reply(e,'打卡失败')
               return true
           }
        }
        catch(err){
            await reply(e,'打卡失败')
        }
        await reply(e,'打卡成功:'+NewestInfo['versionname']+NewestInfo['title'])
    }
    else{
        await reply(e,'已经完成最新一期的学习啦！正在获取学习记录截图... ...')
    }
    // 学习记录截图
    await sendScreenshot(e, OPENID)
}

AutoLearning();
