<script setup>
    import {reactive, ref} from "vue";
    import "@/assets/details.css";
    import requestData from "@/utils/request.js";

    const data = reactive({
        monitor: [
            {id: "temperature", value: 0.0},
            {id: "humidity", value: 0.0},
            {id: "wifiStat", value: ""},
            {id: "lightStat", value: ""},
            {id: "fanStat", value: ""},
        ],
        weather: [
            {id: "city", text: ""},
            {id: "weather", text: ""},
            {id: "temp", text: ""}
        ]
    })

    function checkStat() {

    }

    setInterval(handler => {
        setTimeout(() => {
            requestData.get("/datapoint/history-datapoints", {
                baseURL: "https://iot-api.heclouds.com",
                headers: {"authorization": "version=2022-05-01&res=products%2FHn5sqb3tOh%2Fdevices%2Fmonitor&et=1762853395&method=md5&sign=gZM2CrBY4WJDpRCZr5REWg%3D%3D"},
                params: {
                    product_id: "Hn5sqb3tOh",
                    device_name: "monitor",
                }
            }).then(response => {
                console.log(response)
                data.monitor["temperature"] = response.data["data"]["datastreams"][0]["datapoints"][0]["value"];
                data.monitor["humidity"] = response.data["data"]["datastreams"][4]["datapoints"][0]["value"];
                (response.data["data"]["datastreams"][1]["datapoints"][0]["value"] === 1)
                    ? data.monitor["wifiStat"] = "在线" : data.monitor["wifiStat"] = "离线";
                (response.data["data"]["datastreams"][3]["datapoints"][0]["value"] === 1)
                    ? data.monitor["lightStat"] = "开启" : data.monitor["lightStat"] = "关闭";
                (response.data["data"]["datastreams"][2]["datapoints"][0]["value"] === 1)
                    ? data.monitor["fanStat"] = "开启" : data.monitor["fanStat"] = "关闭";
                console.log("temp:" + data.monitor["temperature"])
                console.log("humi:" + data.monitor["humidity"])
                console.log("wifi:" + data.monitor["wifiStat"])
                console.log("light:" + data.monitor["lightStat"])
                console.log("fan:" + data.monitor["fanStat"])
            })

            requestData.get("/v3/weather/now.json", {
                baseURL: "https://api.seniverse.com",
                params: {
                    key: "SPIRhXLh-dt5N2tga",
                    location: "Guangzhou",
                    language: "zh-Hans",
                    unit: "c",
                }
            }).then(response => {
                data.weather["city"] = response.data["results"][0]["location"]["name"]
                data.weather["weather"] = response.data["results"][0]["now"]["text"]
                data.weather["temp"] = response.data["results"][0]["now"]["temperature"]
            })
        }, 1000)
    }, 1000)

</script>

<template>
    <div style="display: flex; padding: 75px">
        <div class="dataBody">
            监测值
            <div style="font-size: 25px; margin-top: 5px">Monitor</div>
            <div class="valueBody">
                室内温度
                <span style="font-family: 微软雅黑,serif">{{ data.monitor["temperature"] }}℃</span>
            </div>
            <div class="valueBody">
                室内湿度
                <span style="font-family: 微软雅黑,serif">{{ data.monitor["humidity"] }}%</span>
            </div>
        </div>
        <div class="dataBody">
            天气情况
            <div style="font-size: 25px; margin-top: 5px">Weather</div>
            <div class="valueBody" style="margin: 20px">
                当前城市
                <div style="font-family: 微软雅黑,serif">{{ data.weather["city"] }}</div>
            </div>
            <div class="valueBody" style="margin: 20px">
                天气
                <div style="font-family: 微软雅黑,serif">{{ data.weather["weather"] }}</div>
            </div>
            <div class="valueBody" style="margin: 20px">
                大气温度
                <div style="font-family: 微软雅黑,serif">{{ data.weather["temp"] }}℃</div>
            </div>
        </div>
        <div class="dataBody">
            设备状态
            <div style="font-size: 25px; margin-top: 5px">Device State</div>
            <div class="valueBody" style="margin: 20px">
                网络状况
                <div style="font-family: 微软雅黑,serif">{{ data.monitor["wifiStat"] }}</div>
            </div>
            <div class="valueBody" style="margin: 20px">
                灯光状态
                <div style="font-family: 微软雅黑,serif">{{ data.monitor["lightStat"] }}</div>
            </div>
            <div class="valueBody" style="margin: 20px">
                风扇状态
                <div style="font-family: 微软雅黑,serif">{{ data.monitor["fanStat"] }}</div>
            </div>
        </div>
    </div>
</template>
