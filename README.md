# 青年大学习助手
本插件适用于Yunzai(V3)版本，每周定时自动进行山东省青年大学习的打卡（默认设置每周一12:30）,打卡成功后会显示当期标题信息，并且发送学习记录的截图。除定时任务外，也可发送指令``#青年大学习``进行手动打卡。如果不需要在云崽中使用，可以进行删去与bot相关的代码，运行相关 *JavaScript* 代码也可独立完成打卡。
## 打卡流程
首先从[ http://qndxx.youth54.cn/SmartLA/dxxjfgl.w?method=getNewestVersionInfo]( http://qndxx.youth54.cn/SmartLA/dxxjfgl.w?method=getNewestVersionInfo )获取最新一期大学习信息（包括version），随后再通过用户的openid从[http://qndxx.youth54.cn/SmartLA/dxxjfgl.w?method=queryPersonStudyRecord](http://qndxx.youth54.cn/SmartLA/dxxjfgl.w?method=queryPersonStudyRecord)获取学习记录，比对最近一次学习记录与最新一期的version是否一致，不同则进行打卡，成功后会显示“打卡成功！”以及本期大学习的相关概览信息；相同则显示“已经完成最新一期的学习啦！”。最后还会对学习记录页面进行截图，并发送给用户。
## 使用方法
进入Yunzai-bot文件夹
```
cd Yunzai-bot 
```
安装相关依赖
```
npm install axios
```
将js文件放入Yunzai-bot/plugins/example，或者克隆项目
```
git clone https://github.com/gullmansparo/qndxx-helper.git ./plugins/example
```

通过抓包等方式在微信获取青春山东的**openid**,随后进入插件所在的文件夹，打开qndxx-helper.js,将相应的用户QQ号和openid填入OpenidList(可填写多个，QQ号和openid一一对应)，参考如下：
```
 const OpenidList = {
    "123456789": "1qazxsw23edcvfr45tgbnhy67ujmk",
    "987654321": "45tgbnhy67ujmk1qazxsw23edcvfr",
  }
```
安装完毕后重启Yunzai，自动打卡便会开启，向Yunzai机器人发送``#青年大学习``指令就可手动打卡。
## 其他
Yunzai-Bot（v3）: [Github](https://github.com/Le-niao/Yunzai-Bot) / [Gitee](https://gitee.com/Le-niao/Yunzai-Bot)
