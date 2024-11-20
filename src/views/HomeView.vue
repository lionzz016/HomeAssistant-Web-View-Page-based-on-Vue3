<script setup>
    import {computed, reactive, ref} from "vue";
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
        ],
        wifi_icon: false,
        light_icon: false,
        fan_icon: false,
    })

    const showDate = ref("");
    const showTime = ref("");
    let showLunarTime = ref("");

    setInterval(handler => {
        const oDate = new Date()
        const format = () => {
            const year = oDate.getFullYear()
            const L_month = Math.floor((oDate.getMonth() + 1) / 10)
            const R_month = (oDate.getMonth() + 1) % 10
            const L_day = Math.floor(oDate.getDate() / 10)
            const R_day = oDate.getDate() % 10
            return year + '-' + L_month + R_month + '-' + L_day + R_day
        }

        const format2 = () => {
            const L_hour = Math.floor(oDate.getHours() / 10).toString()
            const R_hour = oDate.getHours() % 10
            const L_minutes = Math.floor(oDate.getMinutes() / 10)
            const R_minutes = oDate.getMinutes() % 10
            const L_seconds = Math.floor(oDate.getSeconds() / 10)
            const R_seconds = oDate.getSeconds() % 10
            return L_hour + R_hour + ':' + L_minutes + R_minutes + ':' + L_seconds + R_seconds
        }
        showDate.value = format()
        showTime.value = format2()
    }, 1000)

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
                if (response.data["data"]["datastreams"][1]["datapoints"][0]["value"] === 1
                    ////获取当前时间戳与最新获得的一次Json数据的时间戳做差，如果大于3.666秒，则视为WiFi离线，反之则WiFi在线
                    && (new Date().getTime() - response.data["data"]["datastreams"][1]["datapoints"][0]["at_timestamp"]) < 3666) {
                    data.monitor["wifiStat"] = "在线";
                    data.wifi_icon = true;
                } else {
                    console.log(new Date().getTime());
                    console.log(response.data["data"]["datastreams"][1]["datapoints"][0]["at_timestamp"]);
                    data.monitor["wifiStat"] = "离线";
                    data.wifi_icon = false;
                }
                if (response.data["data"]["datastreams"][3]["datapoints"][0]["value"] === 1) {
                    data.monitor["lightStat"] = "开启";
                    data.light_icon = true;
                } else {
                    data.monitor["lightStat"] = "关闭";
                    data.light_icon = false;
                }
                if (response.data["data"]["datastreams"][2]["datapoints"][0]["value"] === 1) {
                    data.monitor["fanStat"] = "开启";
                    data.fan_icon = true;
                } else {
                    data.monitor["fanStat"] = "关闭";
                    data.fan_icon = false;
                }
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

    setInterval(handler => {
        requestData.get("https://www.36jxs.com/api/Commonweal/almanac", {
            params: {
                sun: showDate.value
            }
        }).then(response => {
            console.log(response)
            const lunar = () => {
                const lunarMonth = response.data["data"]["LMonth"]
                const lunarDay = response.data["data"]["LDay"]
                const lunarTermName = response.data["data"]["SolarTermName"]
                return lunarMonth + lunarDay + " " + lunarTermName
            }
            showLunarTime = lunar()
        })
    }, 1000)


</script>

<template>
    <div class="topBody">
        <div style="font-family: Consolas,serif;text-align: center">{{ showDate }} {{ showTime }}</div>
        <div style="font-family: 幼圆, serif;text-align: center; font-size: 20px;font-weight: bold">农历
            {{ showLunarTime }}
        </div>
    </div>
    <div style="display: flex; margin:0 10px 0 10px;padding: 75px">
        <div class="dataBody">
            监测值
            <div style="font-size: 25px; margin-top: 5px">Monitor</div>
            <div class="valueBody">
                室内温度
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 252">
                    <path fill="#ea580c"
                          d="M212 56a28 28 0 1 0 28 28a28 28 0 0 0-28-28m0 40a12 12 0 1 1 12-12a12 12 0 0 1-12 12m-84 57V88a8 8 0 0 0-16 0v65a32 32 0 1 0 16 0m-8 47a16 16 0 1 1 16-16a16 16 0 0 1-16 16m40-66V48a40 40 0 0 0-80 0v86a64 64 0 1 0 80 0m-40 98a48 48 0 0 1-27.42-87.4A8 8 0 0 0 96 138V48a24 24 0 0 1 48 0v90a8 8 0 0 0 3.42 6.56A48 48 0 0 1 120 232"/>
                </svg>
                <span style="font-family: 微软雅黑,serif; margin: 0 10px 0 5px; padding: 0 0 0 0">{{
                        data.monitor["temperature"].toFixed(1)
                    }}℃</span>
            </div>
            <div class="valueBody">
                室内湿度
                <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.1em" viewBox="0 0 30 25">
                    <path fill="#14aaf5"
                          d="M7.56 17.19q0-1.32.72-3.03c.72-1.71 1.1-2.25 1.86-3.31c1.56-2.06 2.92-3.62 4.06-4.67l.75-.72c.25.26.53.5.83.72c.41.42 1.04 1.11 1.88 2.09s1.57 1.85 2.17 2.65c.71 1.01 1.32 2.1 1.81 3.25s.74 2.16.74 3.03c0 1-.19 1.95-.58 2.86s-.91 1.7-1.57 2.36s-1.45 1.19-2.37 1.58s-1.89.59-2.91.59c-1 0-1.95-.19-2.86-.57s-1.7-.89-2.36-1.55c-.66-.65-1.19-1.44-1.58-2.35s-.59-1.89-.59-2.93m2.26-2.93c0 .83.17 1.49.52 1.99c.35.49.88.74 1.59.74c.72 0 1.25-.25 1.61-.74c.35-.49.53-1.15.54-1.99c-.01-.84-.19-1.5-.54-2c-.35-.49-.89-.74-1.61-.74c-.71 0-1.24.25-1.59.74c-.35.5-.52 1.16-.52 2m1.57 0v-.35c0-.08.01-.19.02-.33s.02-.25.05-.32s.05-.16.09-.24s.09-.15.15-.18c.07-.04.14-.06.23-.06q.21 0 .33.12c.12.12.14.21.17.38c.03.18.05.32.06.45s.01.3.01.52c0 .23 0 .4-.01.52q-.015.18-.06.45c-.03.17-.09.3-.17.38s-.19.12-.33.12c-.09 0-.16-.02-.23-.06a.34.34 0 0 1-.15-.18c-.04-.08-.07-.17-.09-.24c-.02-.08-.04-.19-.05-.32c-.01-.14-.02-.25-.02-.32zm.59 7.75h1.32l4.99-10.74h-1.35zm4.3-2.99c.01.84.2 1.5.55 2c.35.49.89.74 1.6.74c.72 0 1.25-.25 1.6-.74s.52-1.16.53-2c-.01-.84-.18-1.5-.53-1.99s-.88-.74-1.6-.74c-.71 0-1.25.25-1.6.74c-.36.49-.54 1.15-.55 1.99m1.57 0c0-.23 0-.4.01-.52q.015-.18.06-.45c.045-.27.09-.3.17-.38s.19-.12.33-.12q.135 0 .24.06c.07.04.12.1.16.19s.07.17.1.24s.04.18.05.32l.01.32v.69l-.01.32l-.05.32l-.1.24l-.16.19l-.24.06q-.21 0-.33-.12c-.12-.12-.14-.21-.17-.38q-.045-.27-.06-.45c-.015-.18-.01-.3-.01-.53"/>
                </svg>
                <span style="font-family: 微软雅黑,serif; margin: 0 12px 0 2px; padding: 0 0 0 0">{{
                        data.monitor["humidity"].toFixed(1)
                    }}%</span>
            </div>
        </div>
        <div class="dataBody" style="background: linear-gradient(to bottom, #29eac4, #4284db);">
            天气情况
            <div style="font-size: 25px; margin-top: 5px">Weather</div>
            <div class="valueBody" style="margin: 30px">
                当前城市
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <path fill="#47d5f5" fill-rule="evenodd"
                              d="M2 21.25a.75.75 0 0 0 0 1.5h20a.75.75 0 0 0 0-1.5h-5V16c0-1.886 0-2.828-.586-3.414S14.886 12 13 12h-2c-1.886 0-2.828 0-3.414.586S7 14.114 7 16v5.25zM9.25 15a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1-.75-.75m0 3a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1-.75-.75"
                              clip-rule="evenodd"/>
                        <path fill="#47d5f5"
                              d="M8 4.5c.943 0 1.414 0 1.707.293S10 5.557 10 6.5v1.792q.234.114.414.294c.404.404.53.978.569 1.914V12c-1.874 0-2.813.002-3.397.586C7 13.172 7 14.114 7 16v5.25H3V12c0-1.886 0-2.828.586-3.414A1.5 1.5 0 0 1 4 8.292V6.5c0-.943 0-1.414.293-1.707S5.057 4.5 6 4.5h.25V3a.75.75 0 0 1 1.5 0v1.5zm12.644.747c-.356-.514-.984-.75-2.24-1.22c-2.455-.921-3.682-1.381-4.543-.785C13 3.84 13 5.15 13 7.772V12c1.886 0 2.828 0 3.414.586S17 14.114 17 16v5.25h4V7.772c0-1.34 0-2.011-.356-2.525"
                              opacity=".5"/>
                    </svg>
                    <span style="font-family: 微软雅黑,serif;margin: 10px">{{ data.weather["city"] }}</span>
                </div>
            </div>
            <div class="valueBody" style="margin: 30px">
                天气
                <div style="font-family: 微软雅黑,serif">{{ data.weather["weather"] }}</div>
            </div>
            <div class="valueBody" style="margin: 30px">
                大气温度
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <g fill="none" stroke="#ffd414" stroke-linecap="round" stroke-linejoin="round"
                           stroke-width="2">
                            <circle cx="12" cy="32" r="6" fill="#ffd414">
                                <animate fill="freeze" attributeName="cy" dur="0.6s" values="32;12"/>
                            </circle>
                            <g>
                                <path stroke-dasharray="2" stroke-dashoffset="2" d="M12 19v1M19 12h1M12 5v-1M5 12h-1">
                                    <animate fill="freeze" attributeName="d" begin="0.7s" dur="0.2s"
                                             values="M12 19v1M19 12h1M12 5v-1M5 12h-1;M12 21v1M21 12h1M12 3v-1M3 12h-1"/>
                                    <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.7s" dur="0.2s"
                                             values="2;0"/>
                                </path>
                                <path stroke-dasharray="2" stroke-dashoffset="2"
                                      d="M17 17l0.5 0.5M17 7l0.5 -0.5M7 7l-0.5 -0.5M7 17l-0.5 0.5">
                                    <animate fill="freeze" attributeName="d" begin="0.9s" dur="0.2s"
                                             values="M17 17l0.5 0.5M17 7l0.5 -0.5M7 7l-0.5 -0.5M7 17l-0.5 0.5;M18.5 18.5l0.5 0.5M18.5 5.5l0.5 -0.5M5.5 5.5l-0.5 -0.5M5.5 18.5l-0.5 0.5"/>
                                    <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.9s" dur="0.2s"
                                             values="2;0"/>
                                </path>
                                <animateTransform attributeName="transform" dur="30s" repeatCount="indefinite"
                                                  type="rotate" values="0 12 12;360 12 12"/>
                            </g>
                        </g>
                    </svg>
                    <span style="font-family: 微软雅黑,serif;margin: 10px">{{ data.weather["temp"] }}℃</span>
                </div>
            </div>
        </div>
        <div class="dataBody" style="background: linear-gradient(to top, #ffffff, #6dd5fa, #2980b9);">
            设备状态
            <div style="font-size: 25px; margin-top: 5px">Device State</div>
            <div class="valueBody" style="margin: 20px">
                网络状况
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="1.32em" height="0.9em" viewBox="0 0 34 24"
                         v-if="data.wifi_icon">
                        <path fill="#00f110"
                              d="M16.807 0h-.045C10.572 0 4.942 2.4.752 6.319l.013-.012L0 7.02l3.862 3.826l.72-.66c3.201-2.952 7.494-4.763 12.21-4.763s9.009 1.81 12.222 4.774l-.012-.011l.72.66l3.862-3.826l-.765-.713A23.3 23.3 0 0 0 16.845 0h-.041h.002z"/>
                        <path fill="#00f110"
                              d="M27.405 12.03A15.67 15.67 0 0 0 16.83 7.95h-.674l-.007.015a15.72 15.72 0 0 0-9.958 4.076l.013-.012l-.787.713l3.893 3.855l.72-.63c1.791-1.606 4.171-2.587 6.78-2.587s4.989.982 6.79 2.596l-.01-.008l.72.63l3.893-3.854z"/>
                        <path fill="#00f110"
                              d="m16.815 24l5.475-5.415l-.87-.713a7.02 7.02 0 0 0-4.625-1.5h.013h-.066a7.6 7.6 0 0 0-4.567 1.515l.02-.014l-.862.713l.795.787l3.96 3.915z"/>
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="1.32em" height="0.9em" viewBox="0 0 34 24"
                         v-else>
                        <path fill="#999999"
                              d="M16.807 0h-.045C10.572 0 4.942 2.4.752 6.319l.013-.012L0 7.02l3.862 3.826l.72-.66c3.201-2.952 7.494-4.763 12.21-4.763s9.009 1.81 12.222 4.774l-.012-.011l.72.66l3.862-3.826l-.765-.713A23.3 23.3 0 0 0 16.845 0h-.041h.002z"/>
                        <path fill="#999999"
                              d="M27.405 12.03A15.67 15.67 0 0 0 16.83 7.95h-.674l-.007.015a15.72 15.72 0 0 0-9.958 4.076l.013-.012l-.787.713l3.893 3.855l.72-.63c1.791-1.606 4.171-2.587 6.78-2.587s4.989.982 6.79 2.596l-.01-.008l.72.63l3.893-3.854z"/>
                        <path fill="#999999"
                              d="m16.815 24l5.475-5.415l-.87-.713a7.02 7.02 0 0 0-4.625-1.5h.013h-.066a7.6 7.6 0 0 0-4.567 1.515l.02-.014l-.862.713l.795.787l3.96 3.915z"/>
                    </svg>
                    <span style="font-family: 微软雅黑,serif;margin: 7px">{{ data.monitor["wifiStat"] }}</span>
                </div>
            </div>
            <div class="valueBody" style="margin: 20px">
                灯光状态
                <div>
                    <div v-if="data.light_icon" style="position: fixed;margin: 5px 0 0 50px">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                            <path fill="#ffef0f"
                                  d="M12 22q-.825 0-1.412-.587T10 20h4q0 .825-.587 1.413T12 22m-4-3v-2h8v2zm.25-3q-1.725-1.025-2.738-2.75T4.5 9.5q0-3.125 2.188-5.312T12 2t5.313 2.188T19.5 9.5q0 2.025-1.012 3.75T15.75 16z"/>
                        </svg>
                    </div>
                    <div v-else style="position: fixed;margin: 5px 0 0 50px">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                            <path fill="#999999"
                                  d="M12 22q-.825 0-1.412-.587T10 20h4q0 .825-.587 1.413T12 22m-4-3v-2h8v2zm.25-3q-1.725-1.025-2.738-2.75T4.5 9.5q0-3.125 2.188-5.312T12 2t5.313 2.188T19.5 9.5q0 2.025-1.012 3.75T15.75 16z"/>
                        </svg>
                    </div>
                    <span style="font-family: 微软雅黑,serif;padding-left: 20px">{{ data.monitor["lightStat"] }}</span>
                </div>
            </div>
            <div class="valueBody" style="margin: 20px">
                风扇状态
                <div>
                    <div v-if="data.fan_icon" style="position: fixed;margin: 5px 0 0 50px">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                            <path fill="#55acd8"
                                  d="M12 11a1 1 0 0 0-1 1a1 1 0 0 0 1 1a1 1 0 0 0 1-1a1 1 0 0 0-1-1m.5-9c4.5 0 4.61 3.57 2.25 4.75c-.99.49-1.43 1.54-1.62 2.47c.48.2.9.51 1.22.91c3.7-2 7.68-1.21 7.68 2.37c0 4.5-3.57 4.6-4.75 2.23c-.5-.99-1.56-1.43-2.49-1.62c-.2.48-.51.89-.91 1.23c1.99 3.69 1.2 7.66-2.38 7.66c-4.5 0-4.59-3.58-2.23-4.76c.98-.49 1.42-1.53 1.62-2.45c-.49-.2-.92-.52-1.24-.92C5.96 15.85 2 15.07 2 11.5C2 7 5.56 6.89 6.74 9.26c.5.99 1.55 1.42 2.48 1.61c.19-.48.51-.9.92-1.22C8.15 5.96 8.94 2 12.5 2"/>
                        </svg>
                    </div>
                    <div v-else style="position: fixed;margin: 5px 0 0 50px">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                            <path fill="#999999"
                                  d="M12 11a1 1 0 0 0-1 1a1 1 0 0 0 1 1a1 1 0 0 0 1-1a1 1 0 0 0-1-1m.5-9c4.5 0 4.61 3.57 2.25 4.75c-.99.49-1.43 1.54-1.62 2.47c.48.2.9.51 1.22.91c3.7-2 7.68-1.21 7.68 2.37c0 4.5-3.57 4.6-4.75 2.23c-.5-.99-1.56-1.43-2.49-1.62c-.2.48-.51.89-.91 1.23c1.99 3.69 1.2 7.66-2.38 7.66c-4.5 0-4.59-3.58-2.23-4.76c.98-.49 1.42-1.53 1.62-2.45c-.49-.2-.92-.52-1.24-.92C5.96 15.85 2 15.07 2 11.5C2 7 5.56 6.89 6.74 9.26c.5.99 1.55 1.42 2.48 1.61c.19-.48.51-.9.92-1.22C8.15 5.96 8.94 2 12.5 2"/>
                        </svg>
                    </div>
                    <span style="font-family: 微软雅黑,serif;padding-left: 20px">{{ data.monitor["fanStat"] }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
