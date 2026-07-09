/* ================================================================
   projects-carousel.js — Embla carousel rendering project slides
   Each slide: numeric mark + English title + Chinese subtitle +
   short description + optional external link.
   ================================================================ */
(function () {
  'use strict';

  const PROJECTS = [
    {
      n: '01',
      accent: 'oklch(0.55 0.13 200)',
      accentSoft: 'oklch(0.92 0.04 200)',
      title: 'CA-Markov Urbanisation Prediction · Nanchang',
      titleZh: '南昌 · CA-Markov 城市化预测',
      zh: '基于 CA-Markov 模型的南昌市城市化趋势预测',
      zhEn: 'CA-Markov Urbanisation Forecast · Nanchang',
      body: 'A CA-Markov simulation forecasting Nanchang\'s 2030 land-use composition, with the goal of informing the city\'s long-term ecological balance under sustained urbanisation pressure.',
      bodyZh: '基于 CA-Markov 模型，预测 2030 年南昌的土地利用结构，为持续城市化压力下的长期生态平衡提供决策参考。',
      link: 'https://www.researchgate.net/publication/364790236_Study_of_urbanization_trend_prediction_in_Nanchang_based_on_CA-Markov_model',
      linkLabel: 'Read on ResearchGate',
      linkLabelZh: '在 ResearchGate 上阅读',
      details: {
        hero: './assets/fig/projects/01-nanchang-hero.png',
        tagline: {
          en: 'A CA–Markov simulation forecasting Nanchang\'s 2030 land-use composition, built to inform long-term ecological balance under sustained urbanisation pressure.',
          zh: '一项 CA—Markov 模拟研究：预测 2030 年南昌的土地利用结构，为持续城市化压力下的长期生态平衡提供决策参考。',
        },
        sections: [
          {
            heading: { en: 'Motivation', zh: '研究动机' },
            body: {
              en: 'Nanchang has experienced sustained urban expansion over the past two decades, putting growing pressure on its surrounding cropland and ecological corridors. Forecasting the city\'s land-use trajectory matters not as an academic exercise, but as a planning input — where will conversion happen next, and which patches of green space are most at risk?',
              zh: '过去二十年南昌持续扩张，对周边耕地与生态廊道造成持续压力。本研究试图为城市规划提供一项输入：未来的转换最可能发生在哪里？哪些绿色斑块最需要被保护？',
            },
          },
          {
            heading: { en: 'Method', zh: '方法' },
            body: {
              en: 'I combined a Markov transition-probability matrix — fitted from historical Landsat-derived land-use maps — with a Cellular Automata neighbourhood rule that accounts for slope, distance to roads and existing land-use suitability. The coupled CA–Markov model rolls the city forward in 5-year steps to 2030 under a baseline (business-as-usual) scenario.',
              zh: '研究将基于历史 Landsat 土地利用图拟合的马尔可夫转移概率矩阵，与考虑坡度、距道路距离与土地适宜性的元胞自动机邻域规则相结合。耦合后的 CA—Markov 模型在 BAU 基线情景下，以 5 年为步长向前推演到 2030 年。',
            },
            figure: {
              src: './assets/fig/projects/01-nanchang-hero.png',
              caption: {
                en: 'Observed Nanchang land-use composition in 2000, 2010 and 2020 (Landsat, 30 m) — the historical input to the Markov chain.',
                zh: '2000、2010、2020 年南昌土地利用结构（Landsat，30 m），作为马尔可夫链的历史输入。',
              },
            },
          },
          {
            heading: { en: 'Findings', zh: '主要发现' },
            body: {
              en: 'The simulation projects continued conversion of cropland and bare land into built-up area along Nanchang\'s southern and western fringes, while ecological land (forest, water) remains comparatively stable in the core. Built-up area grows from 503 km² (2000) → 797 km² (2010) → 998 km² (2020), with roughly another 668 km² added by 2030. Three-period Kappa values of 0.81 / 0.92 / 0.83 against historical maps support the projection, and the paper recommends targeted protection for the most vulnerable conversion-prone patches identified by the model.',
              zh: '模拟显示：南昌南部与西部边缘的耕地与裸地将持续向建设用地转换，而核心区的生态用地（森林、水体）保持相对稳定。建设用地由 2000 年的 503 km² 增至 2010 年的 797 km²、2020 年的 998 km²，到 2030 年还将再扩张约 668 km²。三期 Kappa 系数 0.81 / 0.92 / 0.83 验证了模型可靠性。论文建议对模型识别出的"最易被转换"的脆弱斑块进行重点保护。',
            },
            figure: {
              src: './assets/fig/projects/01-nanchang-projection.png',
              caption: {
                en: 'CA–Markov projection of Nanchang\'s 2030 land-use composition under the BAU scenario.',
                zh: 'CA—Markov 模型在 BAU 情景下对南昌 2030 年土地利用结构的预测。',
              },
            },
          },
        ],
        bullets: [
          { en: 'Markov chain fitted to historical Landsat land-use maps of Nanchang', zh: '基于南昌历史 Landsat 土地利用图拟合的马尔可夫链' },
          { en: 'Cellular Automata rule with slope · road-distance · suitability constraints', zh: '元胞自动机规则：坡度 · 距道路距离 · 适宜性约束' },
          { en: 'Forecast horizon: 2030, 5-year time step, BAU scenario', zh: '预测期：2030 年，5 年时间步长，BAU 基线情景' },
          { en: 'Output: vulnerability map of cropland → built-up conversion hotspots', zh: '产出：耕地 → 建设用地转换的脆弱性热点地图' },
        ],
        sourceUrl: 'https://www.researchgate.net/publication/364790236_Study_of_urbanization_trend_prediction_in_Nanchang_based_on_CA-Markov_model',
        sourceLabel: { en: 'Read the full paper on ResearchGate', zh: '在 ResearchGate 上阅读全文' },
      },
    },
    {
      n: '02',
      accent: 'oklch(0.55 0.13 145)',
      accentSoft: 'oklch(0.92 0.04 145)',
      title: 'CSLE × GeoDetector Soil Erosion · Dongjiang Basin',
      titleZh: '东江流域 · CSLE × GeoDetector 土壤侵蚀',
      zh: '基于 CSLE 模型和 GeoDetector 的土壤侵蚀分析',
      zhEn: 'CSLE × GeoDetector Soil Erosion Analysis',
      body: 'Quantified the 2016–2020 spatial-temporal pattern of soil erosion across the Dongjiang basin using the Chinese Soil Loss Equation, multi-temporal Landsat vegetation inputs, and GeoDetector for attribution of rainfall, slope and vegetation contributions.',
      bodyZh: '基于中国土壤流失方程（CSLE），结合多时相 Landsat 植被输入，量化东江流域 2016—2020 年土壤侵蚀的时空格局，并通过 GeoDetector 归因降雨、坡度与植被的贡献。',
      link: 'https://acsess.onlinelibrary.wiley.com/doi/abs/10.1002/saj2.20633',
      linkLabel: 'Soil Science Society of America Journal',
      linkLabelZh: 'Soil Science Society of America Journal',
      details: {
        hero: './assets/fig/projects/02-dongjiang-qvalues.png',
        tagline: {
          en: 'Quantifying the 2016–2020 spatial-temporal pattern of soil erosion across the Dongjiang basin with CSLE, then using GeoDetector to attribute rainfall, slope and vegetation contributions.',
          zh: '基于 CSLE 模型量化东江流域 2016—2020 年土壤侵蚀的时空格局，并通过 GeoDetector 归因降雨、坡度与植被的贡献。',
        },
        sections: [
          {
            heading: { en: 'Context', zh: '研究背景' },
            body: {
              en: 'The Dongjiang basin is both a critical drinking-water source for the Pearl River Delta and a region under sustained land-use change. Reliable, spatially explicit estimates of soil-erosion intensity — and an understanding of what actually drives them — are prerequisites for any sediment-control or conservation programme in the basin.',
              zh: '东江流域既是粤港澳大湾区的关键饮用水源地，又长期处于土地利用变化之中。要在流域内做任何水土保持工作，前提都是：得到空间上可靠的土壤侵蚀强度估计，并搞清楚究竟是什么在驱动它。',
            },
            figure: {
              src: './assets/fig/projects/02-dongjiang-area.png',
              caption: {
                en: 'Dongjiang basin study area — drinking-water source for the Greater Bay Area, under sustained land-use pressure.',
                zh: '东江流域研究区——粤港澳大湾区饮用水源地，长期承受土地利用变化压力。',
              },
            },
          },
          {
            heading: { en: 'Method · CSLE', zh: '方法 · CSLE 模型' },
            body: {
              en: 'Erosion was modelled with the Chinese Soil Loss Equation (CSLE): A = R · K · L · S · B · E · T, where A is the annual soil-loss modulus (t·km⁻²·a⁻¹); R is rainfall erosivity, derived from multi-year precipitation records; K is the soil-erodibility factor; L · S are slope-length and slope-steepness factors from a 30 m DEM; and B · E · T are the vegetation cover-management, engineering-practice and tillage-practice factors. The cover factor B was generated from multi-temporal Landsat NDVI. Stacking annual A maps from 2016–2020 then gives the basin-wide erosion-modulus time series used downstream.',
              zh: '侵蚀建模采用中国土壤流失方程 CSLE：A = R · K · L · S · B · E · T。其中 A 为年土壤侵蚀模数（t·km⁻²·a⁻¹）；R 为降雨侵蚀力，由多年降水记录得出；K 为土壤可蚀性因子；L · S 为来自 30 m DEM 的坡长与坡度因子；B · E · T 分别为植被覆盖与管理、工程措施与耕作措施因子，其中 B 由多时相 Landsat NDVI 生成。把 2016—2020 年逐年的 A 图叠在一起，就得到了后续分析所用的流域侵蚀模数时序。',
            },
            figure: {
              src: './assets/fig/projects/02-dongjiang-hero.png',
              caption: {
                en: 'CSLE-derived annual soil-erosion modulus across the Dongjiang basin, 2016 → 2020.',
                zh: '基于 CSLE 模型的东江流域年度土壤侵蚀模数（2016 → 2020）。',
              },
            },
          },
          {
            heading: { en: 'Spatial pattern of erosion', zh: '侵蚀空间格局' },
            body: {
              en: 'Across the five-year window, erosion intensity in the basin is dominated by the moderate class, while heavy / extremely-heavy / intense erosion appears as sporadic patches — large clusters in the south-east of the basin and smaller, scattered patches along the western fringe. Inter-annually, 2016 stands out (basin-average ~4 345 t·km⁻²·a⁻¹, peak ~221 000) followed by 2019 (~3 303), with 2017 / 2018 / 2020 substantially weaker (~1 590 – 1 940).',
              zh: '五年内流域侵蚀强度以"中度"为主，"强烈—剧烈"等级在空间上呈零散分布——大块集中区位于流域东南部，西部边缘则散布有较小的斑块。从年际上看：2016 年最为突出（流域均值约 4 345 t·km⁻²·a⁻¹，峰值约 221 000），其次为 2019 年（约 3 303）；2017 / 2018 / 2020 年明显较弱（约 1 590 – 1 940）。',
            },
            figure: {
              src: './assets/fig/projects/02-dongjiang-erosion-map.png',
              caption: {
                en: 'Figure 3 — Spatial distribution of the soil-erosion modulus in the Dongjiang River basin.',
                zh: '图 3 — 东江流域土壤侵蚀模数的空间分布。',
              },
            },
          },
          {
            heading: { en: 'Attribution · GeoDetector', zh: '归因分析 · GeoDetector' },
            body: {
              en: 'GeoDetector estimates each driver\'s explanatory power through the q-statistic q = 1 − (Σₕ Nₕ σₕ²) / (N σ²), where Nₕ, σₕ² are the size and variance of stratum h. Running the factor detector on the five-year erosion stack ranks the drivers as land use (q ≈ 0.156) > vegetation cover (≈ 0.022) > slope (≈ 0.020) > rainfall (≈ 0.016). Every pair tested in the interaction detector shows nonlinear enhancement — land-use × slope alone lifts the joint explanation to ≈ 0.355. Together: erosion in this basin is mainly an anthropogenic, land-use story; conservation priorities should target reforestation and a ban on steep-slope cultivation.',
              zh: 'GeoDetector 用 q 统计量度量每个驱动因子的解释力：q = 1 − (Σₕ Nₕ σₕ²) / (N σ²)，其中 Nₕ、σₕ² 为分层 h 的样本数与方差。对五年侵蚀栈做因子探测后，排序为：土地利用（q ≈ 0.156） > 植被覆盖（≈ 0.022） > 坡度（≈ 0.020） > 降雨（≈ 0.016）。交互探测显示所有两两因子均为"非线性增强"，仅"土地利用 × 坡度"一项就把联合解释力抬到 ≈ 0.355。结论：东江流域侵蚀以"人为—土地利用"故事为主，水土保持的优先级应指向造林与禁止陡坡开垦。',
            },
            figure: {
              src: './assets/fig/projects/02-dongjiang-radar.png',
              caption: {
                en: 'Figure 9 — q-values of the factor detector (a) and the interaction detector (b) for the four candidate drivers.',
                zh: '图 9 — 四个候选驱动因子的因子探测 q 值（a）与交互探测结果（b）。',
              },
            },
          },
        ],
        bullets: [
          { en: 'CSLE (Chinese Soil Loss Equation) with locally calibrated factors', zh: 'CSLE 中国土壤流失方程 + 本地化标定因子' },
          { en: 'Multi-temporal Landsat NDVI → cover-management factor', zh: '多时相 Landsat NDVI → 植被覆盖与管理因子' },
          { en: '30 m DEM-derived slope length / steepness; multi-year rainfall erosivity', zh: '30 m DEM 衍生坡长坡度；多年降雨侵蚀力' },
          { en: 'GeoDetector factor & interaction analysis (q-statistics)', zh: 'GeoDetector 因子探测与交互探测（q 统计量）' },
          { en: 'Outcome: rainfall × vegetation identified as dominant erosion driver', zh: '结论：识别出"降雨 × 植被"为主导侵蚀驱动' },
        ],
        sourceUrl: 'https://acsess.onlinelibrary.wiley.com/doi/abs/10.1002/saj2.20633',
        sourceLabel: { en: 'Read the paper (Soil Science Society of America Journal)', zh: '阅读论文（Soil Science Society of America Journal）' },
      },
    },
    {
      n: '03',
      accent: 'oklch(0.65 0.15 30)',
      accentSoft: 'oklch(0.92 0.05 30)',
      title: 'Urban–Rural PM2.5 Differentiation · Ganzhou',
      titleZh: '赣州 · 城乡 PM2.5 时空差异',
      zh: '赣州市 PM2.5 时空尺度的城乡差异分析与因素研究',
      zhEn: 'Urban–Rural PM2.5 Differentiation · Ganzhou',
      body: 'A 2020 study of Ganzhou using the 1-km CHAP PM2.5 dataset: characterising the seasonal-spatial pattern, separating urban from rural by built-up aggregation, then using GeoDetector to attribute the urban–rural gradient to ten natural and socio-economic drivers.',
      bodyZh: '以赣州为例，基于 1 km CHAP PM2.5 数据集开展 2020 年研究：刻画时空格局，通过建成区聚合做城乡划分，再用地理探测器把城乡差异归因到 10 个自然与社会经济因子。',
      link: '',
      linkLabel: '',
      linkLabelZh: '',
      details: {
        hero: './assets/fig/projects/03-ganzhou-factors.png',
        tagline: {
          en: 'A 2020 study of Ganzhou using the 1-km CHAP PM2.5 dataset: characterise the seasonal-spatial pattern, separate urban from rural by built-up aggregation, then use GeoDetector to attribute the urban–rural gradient to ten candidate drivers — natural and socio-economic.',
          zh: '一项以赣州为例的 2020 年研究：基于 1 km CHAP PM2.5 数据集刻画其时空格局，通过建成区聚合做城乡划分，再用地理探测器把城乡 PM2.5 差异归因到 10 个候选驱动因子——自然与社会经济并重。',
        },
        sections: [
          {
            heading: { en: 'Setting & question', zh: '研究背景与问题' },
            body: {
              en: 'Ganzhou is the largest prefecture-level city in Jiangxi by area — 39 400 km², 25 districts/counties, 9.5 M people, with elevations ranging from 20 m to 1 877 m. It is industrially active and ecologically complex, which makes city-wide PM2.5 statistics inadequate. Two questions framed this study: (1) what does Ganzhou\'s 2020 PM2.5 actually look like, in space and across months and seasons; and (2) where the urban–rural gradient comes from — natural drivers (rainfall, humidity, wind, temperature, pressure, elevation, vegetation) or socio-economic ones (land use, population, GDP)?',
              zh: '赣州是江西省面积最大的地级市——3.94 万 km²、25 个区县、人口约 950 万，海拔从 20 m 到 1 877 m。城市工业活跃、地形复杂，整城口径的 PM2.5 统计已经不够用了。研究有两个问题：(1) 在空间和年内月、季尺度上，2020 年赣州的 PM2.5 究竟"长什么样"？(2) 它的城乡梯度，到底由自然因子（降雨、湿度、风速、气温、气压、海拔、植被）还是社会经济因子（土地利用、人口、GDP）所驱动？',
            },
          },
          {
            heading: { en: 'Data · 1-km CHAP PM2.5 + 10 drivers', zh: '数据 · 1 km CHAP PM2.5 + 10 类驱动因子' },
            body: {
              en: 'PM2.5 used the 1-km CHAP dataset (long-term, AI-fused, ground + satellite + model). The raw NetCDF was sampled at WheatA station coordinates, aggregated to annual / monthly / seasonal means, point-interpolated and clipped to the basin. Ten candidate drivers were assembled — natural: rainfall, mean pressure, mean wind, mean temperature, relative humidity, elevation (DEM), NDVI; socio-economic: 30-m land-use classes, population density, GDP — and each was reclassified using ArcGIS natural-breaks into 5–6 strata for use with GeoDetector.',
              zh: 'PM2.5 数据采用国产 1 km CHAP（高精度、长时序、AI 融合的地基 + 卫星 + 模式产品）。原始 NetCDF 在 WheatA 县市站点坐标上抽样，合并为年 / 月 / 季均值，再做点插值并裁切到流域。同时整理 10 类候选驱动因子——自然：降雨、平均气压、平均风速、平均气温、相对湿度、海拔（DEM）、植被覆盖度；社会经济：30 m 土地利用、人口密度、GDP——并通过 ArcGIS 自然断点法把每个因子离散化为 5—6 层，供地理探测器使用。',
            },
            figure: {
              src: './assets/fig/projects/03-ganzhou-pm25.jpg',
              caption: {
                en: 'Ganzhou 2020 annual-mean PM2.5: city core acts as the high-value nucleus, decaying outward — and faster east–west than north–south. Annual mean 38.63 μg/m³, already above the national 35 μg/m³ limit.',
                zh: '2020 年赣州 PM2.5 年均空间分布：中心城区为核心高值，向外辐射递减，且东西方向递减快于南北。全市年均 38.63 μg/m³，已高于 35 μg/m³ 的国家年限值。',
              },
            },
          },
          {
            heading: { en: 'Urban–rural delineation', zh: '城乡范围界定' },
            body: {
              en: 'Urban patches were defined in ArcGIS 10.2 by aggregating built-up land within a 1 km radius and keeping only patches ≥ 6 km² — this merges satellite towns into the core while keeping cities apart from each other. Rural counterparts were then built as 5–10 km ring buffers around each urban patch, with water bodies and pixels whose elevation deviated by more than 50 m from the urban maximum excluded. The basin was then cut by a 20 × 20 km fishnet, with centre points used as the GeoDetector sample.',
              zh: '城区：在 ArcGIS 10.2 中以 1 km 缓冲半径聚合建成区，仅保留面积 ≥ 6 km² 的斑块——既能把卫星镇并入主城，又能让相邻城市彼此分开。乡村：在每个城区斑块外做 5—10 km 多环缓冲区，并剔除水体以及与城区最高高程相差 50 m 以上的像元。最后用 20 × 20 km 渔网切割研究区，以渔网中心点作为地理探测器的采样点。',
            },
            figure: {
              src: './assets/fig/projects/03-ganzhou-urban.jpg',
              caption: {
                en: 'Urban / rural extraction over Ganzhou: built-up aggregation defines the urban patches; 5–10 km ring buffers (minus water and high-elevation anomalies) define the rural counterparts.',
                zh: '赣州城乡范围提取：建成区聚合得到城区斑块；5—10 km 多环缓冲区（剔除水体与高程异常）得到对应的乡村范围。',
              },
            },
          },
          {
            heading: { en: 'Temporal pattern', zh: '时间格局' },
            body: {
              en: 'Within the year, PM2.5 falls then rises — high in Dec and Jan–Apr (50.17 μg/m³ peak in Apr), low and stable through Jun–Aug, climbing again from Sep and peaking at 53.61 μg/m³ in Dec. By season, the means are 43.94 (spring) / 22.45 (summer) / 38.81 (autumn) / 49.33 (winter), giving a clean winter > spring > autumn > summer pattern. The seasonal urban–rural gap follows the same shape: ΔPM2.5 is highest in winter and lowest in summer, with spring/autumn in between — annual urban-minus-rural mean of +1.23 μg/m³, with 67% of counties sitting in the −1 to +3 μg/m³ band.',
              zh: '年内 PM2.5 呈现先降后升：1—4 月维持高值（4 月达到 50.17 μg/m³），6—8 月低值平稳，9 月开始反弹，12 月达到全年峰值 53.61 μg/m³。季节均值为：春 43.94 / 夏 22.45 / 秋 38.81 / 冬 49.33 μg/m³，呈现出清晰的"冬 > 春 > 秋 > 夏"规律。城乡 ΔPM2.5 也遵循同一形态：冬高夏低、春秋居中，年均城乡差值 +1.23 μg/m³，67% 的区县落在 −1 到 +3 μg/m³ 区间。',
            },
          },
          {
            heading: { en: 'GeoDetector · single-factor q', zh: '地理探测器 · 单因子 q 值' },
            body: {
              en: 'The factor detector uses q = 1 − (Σₕ Nₕ σₕ²) / (N σ²) — variance explained by the spatial stratification of each driver. Across the 10 factors, single-factor q-values fall in 0.02–0.30: rainfall (0.29) > relative humidity (0.26) > GDP (0.25) > wind (0.18) > temperature (0.13) > elevation (0.12) > pressure (0.11) > population (0.09) > land-use type (0.03) > NDVI (0.02). All F-tests are significant. Rainfall and humidity drag PM2.5 down through wet deposition; GDP rides high because Ganzhou\'s 2020 secondary industry (¥138.9 B, +4.2%) and 2 687 industrial enterprises concentrated emissions in the urban core.',
              zh: '因子探测器的公式为 q = 1 − (Σₕ Nₕ σₕ²) / (N σ²)，即由每个驱动因子的空间分层所解释的方差比例。10 个因子的单因子 q 值集中在 0.02—0.30：降水（0.29）> 相对湿度（0.26）> GDP（0.25）> 风速（0.18）> 气温（0.13）> 海拔（0.12）> 气压（0.11）> 人口密度（0.09）> 土地利用（0.03）> 植被（0.02），所有因子 F 检验均显示显著。降雨与湿度通过湿沉降把 PM2.5 拉低；而 GDP 之所以排名靠前，是因为 2020 年赣州第二产业 1 389 亿元（+4.2%）、2 687 家工业企业大量集中在城区，造成局地排放在城区叠加。',
            },
            figure: {
              src: './assets/fig/projects/03-ganzhou-factors.png',
              caption: {
                en: 'Single-factor q-values for the 10 candidate drivers — rainfall, relative humidity and GDP lead the ranking.',
                zh: '10 个候选驱动因子的单因子 q 值——降水、相对湿度与 GDP 位列前三。',
              },
            },
          },
          {
            heading: { en: 'Urban core · drivers', zh: '城区驱动因子' },
            body: {
              en: 'Restricted to the urban patches, the ranking shifts: wind (0.346) > rainfall (0.332) > GDP (0.297) > humidity (0.230), with the remaining factors at 0.10–0.15. In the interaction detector, GDP × wind ≈ GDP × rainfall ≈ 0.515 — the highest joint q in the whole study. Vegetation, almost inert on its own (q ≈ 0.015), jumps to 0.375 / 0.348 when interacted with wind / rainfall. Bottom line: wind, rainfall and GDP are the three primary drivers of urban PM2.5 in Ganzhou.',
              zh: '把研究区收紧到城区斑块后，排序明显改变：风速（0.346）> 降水（0.332）> GDP（0.297）> 相对湿度（0.230），其余因子集中在 0.10—0.15。交互探测器中，GDP × 风速 ≈ GDP × 降水 ≈ 0.515，是全文最高的联合 q 值。植被本身几乎"不起眼"（q ≈ 0.015），但与风速 / 降水交互后能跃升至 0.375 / 0.348。结论：风速、降水与 GDP 是影响赣州城区 PM2.5 的三大主导因子。',
            },
            figure: {
              src: './assets/fig/projects/03-ganzhou-interaction-urban.jpg',
              caption: {
                en: 'Urban interaction-detector heatmap — GDP × wind and GDP × rainfall jointly reach q ≈ 0.515.',
                zh: '城区交互探测器热力图——GDP × 风速 与 GDP × 降水 的联合 q 值最高，均约 0.515。',
              },
            },
          },
          {
            heading: { en: 'Rural counterpart · drivers', zh: '乡村驱动因子' },
            body: {
              en: 'Rural results re-order the top of the list: relative humidity (0.248) > rainfall (0.242) > GDP (0.178) > wind (0.111). The strongest interaction is humidity × GDP at q = 0.410, followed by rainfall × GDP at 0.373. Vegetation\'s pairwise interactions are nonlinearly enhanced, not just additive. Together with the urban results, the story is clean: GDP is a shared dominant driver across the gradient, but the natural co-driver flips — wind in the urban core, humidity in the countryside.',
              zh: '乡村结果把榜首换了一遍：相对湿度（0.248）> 降水（0.242）> GDP（0.178）> 风速（0.111）。最强交互来自"湿度 × GDP"（q = 0.410），其次为"降水 × GDP"（0.373）。植被与其他因子的两两交互呈非线性增强，而非简单叠加。结合城区结果可以得到一个简洁结论：GDP 是城乡共享的主导驱动；而自然侧的协同因子在城乡之间换了角色——城区是风速，乡村是相对湿度。',
            },
            figure: {
              src: './assets/fig/projects/03-ganzhou-interaction-rural.jpg',
              caption: {
                en: 'Rural interaction-detector heatmap — humidity × GDP reaches q = 0.410, the highest joint q in the rural stratum.',
                zh: '乡村交互探测器热力图——湿度 × GDP 的联合 q 值达到 0.410，为乡村层最高。',
              },
            },
          },
        ],
        bullets: [
          { en: 'PM2.5: 1-km CHAP dataset, sampled to 2020 annual / monthly / seasonal means', zh: 'PM2.5：1 km CHAP 数据集，抽样为 2020 年 / 月 / 季均值' },
          { en: 'Ten drivers: rainfall · humidity · wind · temp · pressure · DEM · NDVI · land-use · population · GDP', zh: '十类驱动：降水 · 湿度 · 风速 · 气温 · 气压 · 海拔 · 植被 · 土地利用 · 人口 · GDP' },
          { en: 'Urban / rural split via 1-km built-up aggregation (≥ 6 km²) + 5–10 km ring buffers', zh: '城乡划分：1 km 建成区聚合（≥ 6 km²）+ 5—10 km 多环缓冲区' },
          { en: '20 × 20 km fishnet centroids as GeoDetector samples', zh: '20 × 20 km 渔网中心点作为地理探测器采样点' },
          { en: 'Top single-factor q: rainfall 0.29 > humidity 0.26 > GDP 0.25', zh: '单因子 q 值前三：降水 0.29 > 湿度 0.26 > GDP 0.25' },
          { en: 'Strongest interaction: GDP × humidity (basin) q = 0.45; GDP × wind/rainfall (urban) q = 0.515', zh: '最强交互：流域内 GDP × 湿度 q = 0.45；城区内 GDP × 风速 / 降水 q = 0.515' },
          { en: 'Urban core driven by wind + rainfall + GDP; countryside by humidity + rainfall + GDP', zh: '城区主导：风速 + 降水 + GDP；乡村主导：湿度 + 降水 + GDP' },
        ],
        sourceUrl: '',
        sourceLabel: { en: '', zh: '' },
      },
    },
    {
      n: '04',
      accent: 'oklch(0.50 0.16 280)',
      accentSoft: 'oklch(0.92 0.04 280)',
      title: 'U-Safety · Bristol Routing for Students',
      titleZh: 'U-Safety · 布里斯托学生安全路径',
      zh: '布里斯托城市安全性评估与学生路线规划',
      zhEn: 'Bristol Urban Safety Assessment & Student Routing',
      body: 'Integrated crime statistics, traffic data and spatial features into a Safety Index (predicted via SAE, ANN and SVM), then routed safer student commutes using Dijkstra\'s and A* algorithms.',
      bodyZh: '将犯罪统计、交通数据与空间特征整合为安全指数（基于 SAE、ANN 与 SVM 预测），并使用 Dijkstra 与 A* 算法为学生通勤规划更安全的路径。',
      link: '',
      linkLabel: '',
      linkLabelZh: '',
      details: {
        hero: './assets/fig/projects/04-usafety-hero.jpg',
        tagline: {
          en: 'My MSc dissertation — a modified U-Safety framework that learns a city-wide Safety Index from multi-source urban data, then plans safer walking routes between halls of residence and academic buildings.',
          zh: '我的硕士毕业项目——在 U-Safety 框架基础上做了改造，从多源城市数据中学习一个全城的安全指数，并据此为学生在宿舍与院系之间规划更安全的步行路径。',
        },
        sections: [
          {
            heading: { en: 'Problem', zh: '研究问题' },
            body: {
              en: 'Existing routing systems optimise for distance or time, rarely for personal safety. For university students walking between halls of residence and academic buildings — often after dark — the shortest path can cross micro-areas with higher crime exposure, poor street lighting or worse traffic-accident records. This project asks: can we predict a fine-grained urban Safety Index from open data, and then use it to plan demonstrably safer routes?',
              zh: '现有路径规划系统多以"最短"或"最快"为目标，几乎不考虑个人安全。对夜晚往返于宿舍与教学楼之间的学生而言，最短路径常会穿过犯罪率较高、街灯昏暗或事故多发的微区域。本项目要回答的问题是：能否从公开数据中预测一张高分辨率的城市安全指数图，并据此规划"可被验证地更安全"的路径？',
            },
          },
          {
            heading: { en: 'Framework', zh: '系统框架' },
            body: {
              en: 'I extend the U-Safety system into a two-stage pipeline. Stage one (Spatial Prediction): multi-city features — police stations, POIs, urban-map structure, street-lighting intensity, housing and crime — are aggregated onto a regular grid, fused into a single feature representation, and used to train neural-network models (an Artificial Neural Network, with Stacked Auto-Encoder and SVM baselines) that predict a Safety Index for every cell. Stage two (Safe-Route Planning): the predicted Safety Index is combined with a traffic-accident database, school/dormitory locations and the OSM road network to build a graph-based cost surface, on which Dijkstra and A* search for the safest, time-feasible routes.',
              zh: '我在 U-Safety 框架基础上构建了一个两阶段流程。第一阶段（空间预测）：将多城市特征——警察局、POI、城市结构、街灯强度、住房与犯罪——汇总到规则网格上，做特征融合，再用神经网络模型（主模型为人工神经网络 ANN，并对比 Stacked Auto-Encoder 与 SVM）预测每个网格的安全指数。第二阶段（安全路径规划）：将预测得到的安全指数与交通事故数据、学校 / 宿舍位置与 OSM 道路网络结合，构建图结构的成本面，使用 Dijkstra 与 A* 搜索"足够快但更安全"的路径。',
            },
            figure: {
              src: './assets/fig/projects/04-usafety-pipeline.jpeg',
              caption: {
                en: 'System architecture: spatial prediction (ANN-based Safety Index) feeds the safe-route planner.',
                zh: '系统架构：空间预测模块（基于 ANN 的安全指数）驱动后端的安全路径规划。',
              },
            },
          },
          {
            heading: { en: 'Predicted Safety Index', zh: '预测得到的安全指数' },
            body: {
              en: 'The trained model produces a Safety Index across the Bristol study area on a fine grid (values shown 0–100). Around the University of Bristol\'s academic cluster and halls of residence, the surface clearly differentiates the well-monitored, well-lit core from a handful of low-score pockets near Old Market / Stokes Croft — exactly the cells a routing engine should learn to avoid.',
              zh: '训练好的模型在布里斯托研究区上输出了高分辨率的安全指数（图中数值 0—100）。在大学教学区与学生宿舍周围，结果清楚地区分出"监控充分、灯光良好"的核心区，以及 Old Market / Stokes Croft 一带几处分数较低的口袋区——这些正是路径规划应当主动绕开的网格。',
            },
            figure: {
              src: './assets/fig/projects/04-usafety-hero.jpg',
              caption: {
                en: 'Predicted Safety Index around University of Bristol schools and dormitories.',
                zh: '布里斯托大学教学楼与学生宿舍周边的安全指数预测结果。',
              },
            },
          },
          {
            heading: { en: 'Safer routes', zh: '更安全的路径' },
            body: {
              en: 'On top of the predicted index, Dijkstra and A* plan origin–destination paths between every hall of residence and each academic building. Compared with a distance-only baseline, the safety-aware routes consistently re-route around low-index cells, at a modest cost in walking time — and remain robust when the underlying traffic-accident layer is swapped in.',
              zh: '在预测出的安全指数之上，Dijkstra 与 A* 在每个宿舍与每栋教学楼之间生成 OD 路径。与"仅距离最优"的基线相比，"安全感知"路径会一致地绕开低分网格，仅以较小的时间代价换取更高的整体安全性；在替换底层交通事故图层后结果依然稳定。',
            },
            figure: {
              src: './assets/fig/projects/04-usafety-route-harbour.png',
              caption: {
                en: 'Example: safer routes from Harbour Court to the academic cluster, plotted over the Safety Index surface.',
                zh: '示例：自 Harbour Court 出发到教学区的安全路径，叠加在安全指数底图之上。',
              },
            },
          },
          {
            heading: { en: 'Safety vs. distance trade-off', zh: '安全 vs. 距离的权衡' },
            body: {
              en: 'A direct comparison across all hall–school pairs shows the safety-aware planner accepting small detours in exchange for measurably lower exposure on the route — a trade-off curve that a student can actually choose to live with at night.',
              zh: '对所有"宿舍—学院"组合做对比可以看到：安全感知规划器愿意接受一些小绕路，以换取路线上明显更低的风险暴露。这是一条学生在夜晚真的可以接受的"安全—距离"权衡曲线。',
            },
            figure: {
              src: './assets/fig/projects/04-usafety-traffic.png',
              caption: {
                en: 'Distance vs. accumulated safety-cost comparison across all OD pairs.',
                zh: '所有 OD 对上的"距离 vs. 累积安全成本"对比。',
              },
            },
          },
        ],
        bullets: [
          { en: 'Two-stage system: spatial Safety-Index prediction → graph-based safe-route planning', zh: '两阶段系统：空间安全指数预测 → 基于图的安全路径规划' },
          { en: 'Multi-source features: police stations · POIs · urban map · street lighting · housing · crime', zh: '多源特征：警察局 · POI · 城市结构 · 街灯 · 住房 · 犯罪' },
          { en: 'Models: ANN (primary) · Stacked Auto-Encoder · SVM baselines', zh: '模型：ANN（主模型）· 堆叠自编码器 · SVM 基线' },
          { en: 'Routing: Dijkstra and A* on a safety-weighted cost graph derived from the predicted index', zh: '路径规划：在"安全加权"的图结构上运行 Dijkstra 与 A*' },
          { en: 'Deliverable: predicted Safety Index map + safe routes for every Bristol hall ↔ school pair', zh: '交付：预测安全指数地图 + 每个"布里斯托宿舍 ↔ 学院"对的安全路径' },
        ],
        sourceUrl: 'https://github.com/Coldzera-010825/geospatial-Lab/tree/main/safety%20analysis%20projects',
        sourceLabel: { en: 'View project source on GitHub', zh: '在 GitHub 查看项目源码' },
      },
    },
    {
      n: '05',
      accent: 'oklch(0.60 0.14 50)',
      accentSoft: 'oklch(0.92 0.04 50)',
      title: 'Who Is the Top Dog?',
      titleZh: '机器学习与犬种人气',
      zh: '机器学习在犬种人气分析中的应用',
      zhEn: 'Who Is the Top Dog? — ML on Breed Popularity',
      body: 'A side-study using regression and classification (linear, logistic, random forest, KNN, decision tree) to identify factors behind dog-breed popularity — an exercise in interpretable ML on a non-research dataset.',
      bodyZh: '一项练手研究：综合回归与分类方法（线性、逻辑、随机森林、KNN、决策树），识别影响犬种人气的关键因素，借此练习在非科研数据集上的可解释机器学习。',
      link: '',
      linkLabel: '',
      linkLabelZh: '',
      details: {
        hero: './assets/fig/projects/05-topdog-hero.png',
        tagline: {
          en: 'A Bristol MSc-ML mid-term project — predicting dog-breed popularity (regression) and "Editor\'s Choice" (classification) on a 4-column trait dataset, with five classical learners benchmarked side-by-side and interpretability treated as the actual deliverable.',
          zh: '一项布里斯托机器学习课程的期中项目——基于犬种性格特征数据集，回归预测"人气"、分类预测"编辑推荐"，并把五种经典模型并排基准化对比；"可解释性"是真正的目标产出。',
        },
        sections: [
          {
            heading: { en: 'Setup · data & target', zh: '设置 · 数据与目标' },
            body: {
              en: 'The dataset (≈ 200 breeds × 11 columns) ships per-breed trait scores — playfulness, drool, protectiveness, barking, grooming_needs, editors_choice — plus a continuous popularity score. Two parallel tasks were built on the same 80 / 20 split: a regression task predicting the continuous popularity, and a classification task predicting the binary editors_choice flag from those same traits.',
              zh: '数据集（约 200 个品种 × 11 个变量）给出了每个品种的性格评分——playfulness、drool、protectiveness、barking、grooming_needs、editors_choice——以及一项连续的"人气"分数。本项目在同一份 80 / 20 切分上同时构建两类任务：用回归预测连续的"人气"，用分类预测二值的"编辑推荐"。',
            },
          },
          {
            heading: { en: 'Regression · hybrid feature selection', zh: '回归 · 混合式特征选择' },
            body: {
              en: 'A vanilla linear regression hit MSE ≈ 0.0196 and R² ≈ 0.214 — i.e. only 21% of popularity variance explained. To clean up the feature set I ran a hybrid forward-backward selection (threshold-in 0.05, threshold-out 0.10) on OLS p-values. The procedure converged on six predictors — playfulness, drool, protectiveness, barking, grooming_needs and editors_choice — which were carried into every model downstream.',
              zh: '原始线性回归的 MSE ≈ 0.0196，R² ≈ 0.214——只能解释 21% 的"人气"方差。为收紧特征集，我在 OLS p 值上跑了一遍前进 + 后退的混合式选择（入选阈值 0.05，剔除阈值 0.10）。最终收敛于 6 个变量：playfulness、drool、protectiveness、barking、grooming_needs、editors_choice，这套变量被全部下游模型沿用。',
            },
          },
          {
            heading: { en: 'Regression · three learners benchmarked', zh: '回归 · 三模型对比基准' },
            body: {
              en: 'On the six selected features I fit three regressors on the identical split: Linear Regression, 10-NN (then grid-searched over k = 1–29 with distance weighting), and Random Forest (100 trees). Random Forest came out on top, explaining ~ 44% of out-of-sample variance — comfortably ahead of linear regression and the tuned KNN, which the project treated as bounded by the curse of dimensionality on this small, low-signal table.',
              zh: '在 6 个选定特征上，于同一份划分上拟合了三种回归器：线性回归、10-NN（再对 k = 1—29 做距离加权网格搜索）、以及随机森林（100 棵树）。结果：随机森林位列第一，解释了约 44% 的样本外方差，明显领先线性回归和调参后的 KNN——后两者在这种"小且信号弱"的表格数据上，被项目报告界定为受困于维度诅咒。',
            },
          },
          {
            heading: { en: 'Bias audit · Terriers', zh: '偏倚审查 · 㹴犬' },
            body: {
              en: 'I added an is_terrier flag and re-ran the linear and the random-forest models to check for systematic bias against Terrier breeds. The linear model produced a very small negative coefficient and, more diagnostic, positive mean residuals on Terrier breeds — i.e. it systematically under-rated their popularity. The Random Forest, by contrast, showed lower MSE on the Terrier subgroup than on the rest — no equivalent bias signature.',
              zh: '我新增了 is_terrier 标志位，重新跑线性与随机森林两个模型，用来检查对㹴犬类的系统性偏倚。线性模型上：is_terrier 的系数为很小的负值，更关键的是㹴犬组残差均值为正——即模型系统性地低估了㹴犬的人气。而随机森林相反：在㹴犬子集上的 MSE 反而比其他品种低，没有同类偏倚信号。',
            },
          },
          {
            heading: { en: 'Classification · interpretable decision tree', zh: '分类 · 可解释的决策树' },
            body: {
              en: 'For the editors_choice classification task I ran a 5-fold cross-validated grid search (max_depth × min_samples_split × criterion) on a DecisionTreeClassifier with min_samples_leaf = 10. The grid converged on criterion = gini, max_depth = 3 — exactly the kind of shallow tree you want when interpretability is the deliverable. Each path to a leaf reads off in plain language as a chain of trait thresholds.',
              zh: '在"是否编辑推荐"的分类任务上，我对决策树分类器（min_samples_leaf = 10）做了 5 折交叉验证 + 网格搜索（max_depth × min_samples_split × criterion）。最终收敛于 criterion = gini、max_depth = 3——正是把"可解释性"当成产出时所需要的浅树形态：从根到任一叶节点的路径，都可以读成一串性格阈值的自然语言规则。',
            },
            figure: {
              src: './assets/fig/projects/05-topdog-tree.png',
              caption: {
                en: 'Figure 2 — High-resolution decision tree for "Editor\'s Choice" prediction (gini, max_depth = 3, min_samples_leaf = 10).',
                zh: '图 2 — 用于"编辑推荐"预测的高分辨率决策树（gini，max_depth = 3，min_samples_leaf = 10）。',
              },
            },
          },
          {
            heading: { en: 'Classification · model comparison', zh: '分类 · 模型对比' },
            body: {
              en: 'Across the same 67 / 33 split I fit Decision Tree, grid-searched Logistic Regression (C = 10, solver = saga) and grid-searched Random Forest (100 trees, min_samples_split = 10). On confusion matrices Logistic Regression was the most "conservative" — most true negatives, fewest false positives; Decision Tree was the most permissive — more true positives but more false positives; Random Forest sat in between. A bootstrap of 1 000 logistic fits also placed the original logistic accuracy near the upper end of the 95% bootstrap interval, supporting it as the stable choice.',
              zh: '在同一份 67 / 33 切分上，分别拟合：决策树、经网格搜索的逻辑回归（C = 10，solver = saga）以及网格搜索的随机森林（100 棵树，min_samples_split = 10）。从混淆矩阵看：逻辑回归最"保守"——真负样本最多、假阳性最少；决策树最"激进"——真阳性更多但假阳性也更多；随机森林处于二者之间。再加上对逻辑回归做 1 000 次自助法重抽样验证，原模型准确率落在自助法 95% 置信区间的上沿附近，进一步支持把它作为"稳健首选"。',
            },
          },
          {
            heading: { en: 'Headline takeaway', zh: '核心结论' },
            body: {
              en: 'Cross-model agreement was actually the headline deliverable: barking, grooming_needs, drool, protectiveness and playfulness consistently surface as the dominant traits behind popularity across regression and tree models alike. Random Forest is the strongest predictor on the regression side; Logistic Regression is the most stable classifier; and the depth-3 decision tree is the most explainable artefact — exactly the trio I want students to come away with after a classical-ML benchmark.',
              zh: '"几种模型的一致看法"才是这次项目的真正产出：barking、grooming_needs、drool、protectiveness、playfulness 在回归与决策树模型中都稳定地浮在影响人气的特征前列。回归侧最强：随机森林；分类侧最稳：逻辑回归；最具可解释性：深度 3 的决策树——三者恰好是"经典机器学习基准化对比"应当留给学生的三件事。',
            },
          },
        ],
        bullets: [
          { en: 'Dataset: ~200 breeds × 11 columns of trait scores + popularity', zh: '数据集：约 200 个品种 × 11 个特征列（性格评分 + 人气）' },
          { en: 'Hybrid forward-backward feature selection on OLS p-values → 6 predictors', zh: '基于 OLS p 值的前进 + 后退混合式特征选择 → 6 个变量' },
          { en: 'Regression: Linear · 10-NN (grid-searched) · Random Forest (winner, R² ≈ 0.44)', zh: '回归：线性 · 10-NN（网格搜索）· 随机森林（胜者，R² ≈ 0.44）' },
          { en: 'Terrier-bias audit: linear under-rates; Random Forest unbiased', zh: '㹴犬偏倚审查：线性模型存在系统性低估；随机森林无此现象' },
          { en: 'Classification: gini, depth-3 decision tree + logistic + random forest', zh: '分类：gini、深度 3 决策树 + 逻辑回归 + 随机森林' },
          { en: '1 000-iteration bootstrap supports logistic regression as the stable choice', zh: '1 000 次自助法重抽样支持逻辑回归作为稳健首选' },
          { en: 'Cross-model consistent drivers: barking · grooming · drool · protectiveness · playfulness', zh: '多模型一致的主导因子：barking · grooming · drool · protectiveness · playfulness' },
        ],
        sourceUrl: 'https://github.com/Coldzera-010825/geospatial-Lab/blob/main/Machine%20learing%20projects/who%27s%20the%20top%20dog(machine%20learing).ipynb',
        sourceLabel: { en: 'Open the notebook on GitHub', zh: '在 GitHub 打开 notebook' },
      },
    },
    {
      n: '06',
      accent: 'oklch(0.55 0.12 250)',
      accentSoft: 'oklch(0.92 0.04 250)',
      title: 'HCV Incidence Among People Who Inject Drugs · Georgia',
      titleZh: '格鲁吉亚 · 注射毒品人群中的 HCV 发病率',
      zh: '格鲁吉亚注射毒品人群中丙型肝炎发病率分析',
      zhEn: 'HCV Incidence in People Who Inject Drugs · Georgia',
      body: 'A team study cleaning and transforming over 1M HCV testing records in R, calculating seroconversion-based incidence rates, and producing geospatial visualisations of high-risk regions to support public-health planning.',
      bodyZh: '团队研究：在 R 中清洗并转换超过 100 万条 HCV 检测记录，基于血清转化率计算发病率，并制作高风险地区的地理空间可视化，为公共卫生规划提供支持。',
      link: '',
      linkLabel: '',
      linkLabelZh: '',
      details: {
        hero: null,
        tagline: {
          en: 'A team study: cleaning over one million HCV testing records in R, deriving seroconversion-based incidence rates, and mapping where the residual outbreak risk among people who inject drugs in Georgia actually lives.',
          zh: '一项团队研究：用 R 清洗超过 100 万条丙肝（HCV）检测记录，基于血清转化率推导发病率，并在地图上呈现格鲁吉亚注射毒品人群中真正残留的疫情风险地区。',
        },
        sections: [
          {
            heading: { en: 'Why', zh: '研究动机' },
            body: {
              en: 'Georgia (the country) has run one of the world\'s most ambitious HCV elimination programmes, but residual transmission risk concentrates in vulnerable sub-populations — particularly people who inject drugs (PWID). Surveillance datasets at this scale (>1M records) are rarely clean enough to use directly, and turning them into a defensible incidence estimate is itself a substantial piece of engineering.',
              zh: '格鲁吉亚（国家）执行着全球最具雄心的丙肝清除计划之一，但残余的传播风险集中在脆弱亚群体——尤其是注射毒品人群（PWID）。这种规模的监测数据（>100 万条记录）很难直接拿来用，而把它转化为一项站得住脚的发病率估计本身，就是一项工程。',
            },
          },
          {
            heading: { en: 'Data pipeline', zh: '数据流程' },
            body: {
              en: 'In R, we deduplicated patient testing histories, harmonised assay types across years, reconstructed first-positive and first-negative dates per individual, and identified valid seroconversion windows. Incidence rates were then estimated per region and per risk subgroup, with bootstrap CIs to reflect uncertainty in window definition.',
              zh: '在 R 中：对患者检测历史做去重，统一各年的检测方法编码，为每个个体重建首阳与首阴时间，识别合法的血清转化窗口；按地区与亚群体估计发病率，并通过 bootstrap 给出反映窗口定义不确定性的置信区间。',
            },
          },
          {
            heading: { en: 'Geospatial output', zh: '地理空间产出' },
            body: {
              en: 'Region-level incidence among PWID was joined to Georgia\'s administrative geometries and rendered as small-multiple choropleths plus a "where to deploy next" priority map — the deliverable the team\'s public-health collaborators actually wanted: not a single national headline number, but a ranked, defensible spatial signal.',
              zh: '将各地区 PWID 中的发病率与格鲁吉亚行政边界图层对接，绘制成"小多图（small multiples）"与一张"下一步资源应优先投放到哪里"的优先级地图——这正是公共卫生合作方真正需要的成果：不是一项全国头条数字，而是一张可排序、可解释的空间信号图。',
            },
          },
        ],
        bullets: [
          { en: 'Dataset: >1M HCV testing records, cleaned and harmonised in R', zh: '数据集：>100 万条 HCV 检测记录，在 R 中清洗与对齐' },
          { en: 'Per-individual seroconversion window reconstruction', zh: '逐个体重建血清转化窗口' },
          { en: 'Region × subgroup incidence rates with bootstrap CIs', zh: '按地区 × 亚群体估计发病率，并给出 bootstrap 置信区间' },
          { en: 'Small-multiple choropleths + actionable priority map', zh: '小多图 choropleth + 可操作的优先级地图' },
          { en: 'Team study supporting public-health planning for PWID in Georgia', zh: '团队研究，为格鲁吉亚 PWID 的公共卫生规划提供支持' },
        ],
        sourceUrl: '',
        sourceLabel: { en: '', zh: '' },
      },
    },
    {
      n: '07',
      accent: 'oklch(0.55 0.13 145)',
      accentSoft: 'oklch(0.92 0.04 145)',
      title: 'Carbon Emissions in the Pearl River Basin',
      titleZh: '珠江流域碳排放（合著）',
      zh: '珠江流域碳排放时空特征研究 (co-author)',
      zhEn: 'Pearl River Basin Carbon Emissions (co-author)',
      body: 'Co-authored work building a high-resolution carbon-emission grid (2001–2020) from land-use and biomass-burning records, using SHAP for interpretability. Forests emerged as the dominant carbon sink (>99 % sequestration); construction-land emissions grew by 175.9 %.',
      bodyZh: '合著研究：基于土地利用与生物质燃烧记录，构建 2001—2020 年高分辨率碳排放栅格，并使用 SHAP 进行可解释性分析。森林是主导性碳汇（占 >99% 的固碳量），建设用地排放增长了 175.9%。',
      link: 'https://onlinelibrary.wiley.com/doi/10.1002/ldr.70043',
      linkLabel: 'Land Degradation & Development, 2025',
      linkLabelZh: 'Land Degradation & Development，2025',
      details: {
        hero: './assets/fig/projects/07-pearl-hero.png',
        tagline: {
          en: 'Co-authored work building a high-resolution carbon-emission grid for the Pearl River basin (2001–2020) from land-use and biomass-burning records, with SHAP interpretation showing forests doing nearly all of the heavy lifting.',
          zh: '一项合著研究：从土地利用与生物质燃烧记录出发，构建珠江流域 2001—2020 年高分辨率碳排放栅格，并用 SHAP 揭示出"几乎所有重要的固碳工作都是森林在做"。',
        },
        sections: [
          {
            heading: { en: 'Setting', zh: '研究背景' },
            body: {
              en: 'The Pearl River basin sits at the intersection of two strong pressures: rapid expansion of the Greater Bay Area\'s built-up land, and ongoing reforestation across the upper catchment. Knowing how those two trends net out — and where in the basin — is a prerequisite for any credible regional carbon strategy.',
              zh: '珠江流域同时承受着两股强力：粤港澳大湾区建设用地的快速扩张，以及上游持续的造林。要做任何可信的区域碳战略，前提都是先知道这两股力量在哪里、如何相互抵消。',
            },
            figure: {
              src: './assets/fig/projects/07-pearl-area.png',
              caption: {
                en: 'Figure 1 — Pearl River basin study area, spanning upper-catchment forest cover to the downstream Greater Bay Area.',
                zh: '图 1 — 珠江流域研究区，覆盖上游森林区到下游粤港澳大湾区。',
              },
            },
          },
          {
            heading: { en: 'Method · research framework', zh: '方法 · 研究框架' },
            body: {
              en: 'We assembled a 2001–2020 land-use time series and biomass-burning records over the basin and used them to drive a high-resolution gridded carbon-emission model. To make the resulting numbers interpretable rather than just predictive, we ran SHAP attribution on the model — turning a black-box estimate into per-pixel contributions of each land-use class and each driver.',
              zh: '研究构建了 2001—2020 年的流域土地利用时间序列与生物质燃烧记录，驱动一个高分辨率的栅格化碳排放模型。为了让结果"可解释"而不仅仅"可预测"，我们对模型做了 SHAP 归因——把黑盒估计拆解为每一格上各土地利用类型与各驱动因子的贡献。',
            },
            figure: {
              src: './assets/fig/projects/07-pearl-framework.png',
              caption: {
                en: 'Figure 2 — Overall research framework: land-use + biomass-burning inputs → gridded carbon-emission model → SHAP attribution.',
                zh: '图 2 — 研究框架：土地利用 + 生物质燃烧输入 → 栅格化碳排放模型 → SHAP 归因。',
              },
            },
          },
          {
            heading: { en: 'Pixel-scale land-use carbon flux', zh: '像元级土地利用碳通量' },
            body: {
              en: 'Across 2001–2020, construction-land area grew by 85.15% while its carbon emissions grew by 175.89% — concentrated downstream in the Pearl River Delta. Forests cover only ~68% of the basin yet account for over 99% of total carbon absorption, with the upper catchment acting as a persistent net sink even as the delta\'s source signature intensifies.',
              zh: '2001—2020 年间，建设用地面积增长 85.15%，碳排放增长 175.89%，集中分布在下游珠三角。森林覆盖流域约 68% 的面积，却贡献了 >99% 的碳吸收；上游持续表现为净碳汇，下游则碳源信号不断增强。',
            },
            figure: {
              src: './assets/fig/projects/07-pearl-pixel-flux.png',
              caption: {
                en: 'Figure 4 — Pixel-scale changes in land-use carbon emissions across the basin, 2001 → 2020.',
                zh: '图 4 — 流域 2001 → 2020 年像元尺度土地利用碳排放变化。',
              },
            },
          },
          {
            heading: { en: 'Carbon-balance subregions', zh: '碳平衡分区' },
            body: {
              en: 'Aggregating sources and sinks at the pixel level lets us partition the basin into carbon-balance subregions. Across the five snapshots (2001, 2005, 2010, 2015, 2020), the strong-sink zone in the upper catchment stays remarkably stable, while the strong-source zone migrates and expands along the delta — i.e. the basin is still a net sink overall, but the sink-to-source ratio is declining.',
              zh: '把碳源 / 汇在像元上累加，可以把流域划分为不同的"碳平衡分区"。在 2001、2005、2010、2015、2020 五期快照上，上游的"强碳汇"分区保持高度稳定，而下游的"强碳源"分区则沿珠三角持续迁移与扩张——流域整体仍为净碳汇，但"碳汇 / 碳源"比正在下降。',
            },
            figure: {
              src: './assets/fig/projects/07-pearl-balance.png',
              caption: {
                en: 'Figure 5 — Spatial distribution of carbon-balance subregions, with subregion area ratios in panel (f).',
                zh: '图 5 — 流域碳平衡分区的空间分布，(f) 给出各分区面积比例。',
              },
            },
          },
          {
            heading: { en: 'Drivers · SHAP importance', zh: '驱动因子 · SHAP 重要性' },
            body: {
              en: 'SHAP attribution identifies what is driving sinks and sources separately. In sink areas, natural drivers — especially temperature — dominate the SHAP magnitude. In source areas, anthropogenic drivers — especially population — take over. The policy implication is clean: any net-gain strategy must protect upper-catchment forest cover at the same time as it bends the downstream construction trajectory.',
              zh: 'SHAP 归因把"什么在驱动碳汇"和"什么在驱动碳源"分开来回答。在碳汇区，自然因子——尤其是温度——主导 SHAP 量级；在碳源区，则由人为因子——尤其是人口——主导。政策含义很明确：任何"净增益"战略，都必须同时做到保护上游森林、扳弯下游建设曲线。',
            },
            figure: {
              src: './assets/fig/projects/07-pearl-importance.png',
              caption: {
                en: 'Figure 9 — Variable-importance ranking for carbon-sink vs. carbon-source regions, 2001–2020.',
                zh: '图 9 — 2001—2020 年"碳汇区 vs. 碳源区"的变量重要性排序。',
              },
            },
          },
        ],
        bullets: [
          { en: '2001–2020 land-use time series + biomass-burning records → gridded carbon-emission model', zh: '2001—2020 年土地利用时序 + 生物质燃烧记录 → 栅格化碳排放模型' },
          { en: 'SHAP attribution turns the model into per-pixel, per-driver contributions', zh: 'SHAP 归因：把模型拆解为每像元、每驱动因子的贡献' },
          { en: 'Forests >99% of sequestration; construction-land emissions +175.9%', zh: '森林贡献 >99% 的固碳；建设用地排放 +175.9%' },
          { en: 'Published in Land Degradation & Development (2025)', zh: '论文发表于 Land Degradation & Development（2025）' },
        ],
        sourceUrl: 'https://onlinelibrary.wiley.com/doi/10.1002/ldr.70043',
        sourceLabel: { en: 'Read the paper (Land Degradation & Development, 2025)', zh: '阅读论文（Land Degradation & Development, 2025）' },
      },
    },
    {
      n: '08',
      accent: 'oklch(0.55 0.13 215)',
      accentSoft: 'oklch(0.92 0.04 215)',
      title: 'Urban Analytics · Bristol Night-Light Safety',
      titleZh: 'Urban Analytics · 布里斯托夜灯安全分析',
      zh: '基于夜灯遥感的布里斯托城市安全与学生路径分析',
      zhEn: 'Bristol Urban Safety from Night-Light Remote Sensing',
      body: 'An R-based urban-analytics study: built a city-wide Safety Factor from VIIRS night-light data, then planned shortest "safe" routes between University of Bristol halls of residence and academic buildings on a cost-distance graph.',
      bodyZh: '一项基于 R 的城市分析研究：用 VIIRS 夜灯遥感数据构造城市安全因子，并在成本距离图上规划布里斯托大学宿舍与院系之间的"最短安全路径"。',
      link: './assets/reports/urban.html',
      linkLabel: 'Read the full report',
      linkLabelZh: '阅读完整研究报告',
      details: {
        hero: './assets/fig/projects/08-urban-fig1.png',
        tagline: {
          en: 'A complete R / R Markdown research report: VIIRS night lights → city Safety Factor → cost-distance matrix → shortest safe routes for University of Bristol students.',
          zh: '一份完整的 R / R Markdown 研究报告：VIIRS 夜灯 → 城市安全因子 → 成本距离矩阵 → 布里斯托大学学生的最短安全路径。',
        },
        sections: [
          {
            heading: { en: 'Background', zh: '研究背景' },
            body: {
              en: 'Night-light remote sensing has been widely used to study urban growth, spatial connectivity and city categorisation, but rarely as a proxy for urban safety. This project treats Bristol as a case study: night-light intensity stands in as a coarse but city-wide signal of nocturnal human activity, and the spatial pattern of that signal is used to construct a Safety Factor for the city.',
              zh: '夜灯遥感被广泛用于研究城市扩张、空间联系与城市分类，但很少被用作城市安全的代理变量。本项目以布里斯托为例：把夜光强度作为"夜间人类活动"的粗略但覆盖全城的信号，再用它的空间格局来构建一张城市安全因子图。',
            },
            figure: {
              src: './assets/fig/projects/08-urban-fig2.png',
              caption: {
                en: 'Bristol study area — the urban core covered by the night-light analysis.',
                zh: '布里斯托研究区——夜灯分析覆盖的城市核心区。',
              },
            },
          },
          {
            heading: { en: 'Data & method', zh: '数据与方法' },
            body: {
              en: 'I used Earth Observation Group (EOG) VIIRS night-light rasters for Bristol, along with OpenStreetMap street networks and the locations of University of Bristol halls of residence and academic buildings. The night-light raster was clipped to the city boundary, vectorised, and converted into a Safety Factor — areas with higher light intensity and shorter cost distance read as more amenable to human activity; dark pixels are treated as effectively disconnected. The result is a cost-distance matrix on the OSM road graph, ready for routing.',
              zh: '研究使用了 EOG 提供的布里斯托 VIIRS 夜灯栅格，以及 OpenStreetMap 街道网络与布里斯托大学宿舍 / 院系的位置数据。先将夜灯栅格按城市边界裁切并矢量化，再据此计算安全因子——光强较高、成本距离较短的区域被视为更利于人类活动，完全黑暗的像元则视为不连通。最终在 OSM 路网上得到一张成本距离矩阵，可直接用于路径规划。',
            },
            figure: {
              src: './assets/fig/projects/08-urban-hero.png',
              caption: {
                en: 'Safety-Factor / cost matrix preview between selected halls and academic buildings.',
                zh: '部分宿舍与教学楼之间的安全因子 / 成本矩阵预览。',
              },
            },
          },
          {
            heading: { en: 'Routing & outputs', zh: '路径规划与产出' },
            body: {
              en: 'Using the OSRM-driven cost-distance matrix, the report computes shortest safe routes between every pair of halls and academic buildings. The interactive Leaflet map shows the resulting paths, coloured by the underlying Safety Factor (≈0.91 – 0.96) along each segment, so students can see at a glance which segments contribute most of the residual risk.',
              zh: '基于 OSRM 驱动的成本距离矩阵，报告在每个"宿舍—教学楼"对之间计算最短安全路径。最终的 Leaflet 交互地图按沿线安全因子（约 0.91 – 0.96）对路径着色，学生可以直观地看出剩余风险主要来自哪些路段。',
            },
            figure: {
              src: './assets/fig/projects/08-urban-fig1.png',
              caption: {
                en: 'Interactive Leaflet output: shortest safe routes between halls and academic buildings, coloured by Safety Factor.',
                zh: '交互式 Leaflet 输出：宿舍与教学楼之间的最短安全路径，按安全因子着色。',
              },
            },
          },
        ],
        bullets: [
          { en: 'EOG VIIRS night-light raster + OSM street network + UoB halls / academic buildings', zh: 'EOG VIIRS 夜灯栅格 + OSM 街道网络 + 布大宿舍 / 院系位置' },
          { en: 'Night-light raster → clipped → vectorised → Safety Factor (0 – 1)', zh: '夜灯栅格 → 裁切 → 矢量化 → 安全因子（0 – 1）' },
          { en: 'Cost-distance matrix built on the OSRM-routed road graph', zh: '在 OSRM 路网上构建成本距离矩阵' },
          { en: 'R toolchain: raster · sf · tidyverse · leaflet · osrm · accessibility · ggplot2', zh: 'R 工具栈：raster · sf · tidyverse · leaflet · osrm · accessibility · ggplot2' },
          { en: 'Deliverable: a full R Markdown report (urban.html) with maps and discussion', zh: '交付：完整的 R Markdown 研究报告（urban.html），含地图与讨论' },
        ],
        sourceUrl: './assets/reports/urban.html',
        sourceLabel: { en: 'Open the full report (urban.html)', zh: '打开完整研究报告（urban.html）' },
      },
    },
    {
      n: '09',
      accent: 'oklch(0.52 0.16 300)',
      accentSoft: 'oklch(0.92 0.05 300)',
      title: 'Geospatial Research Visualization · A Living Showcase',
      titleZh: '地理空间科研可视化 · 展示总集',
      zh: '一个持续生长的练习集：用更有代表性的图表与配色，表达地理空间科研结果',
      zhEn: 'An ongoing practice set of visualization types and palettes for research',
      body: 'A growing personal showcase where I practice compelling, sometimes unconventional ways to visualize geospatial science — both visualization types and colour palettes — so that research results can be expressed more representatively, and ultimately carried into real scientific output. Five pieces so far: 3D figures with ggcube in R; a circular lollipop–heatmap hybrid in Python; a violin + correlation + bubble composite for urban facility equity; declarative CNN/U-Net architecture diagrams with PlotNeuralNet; and classic node-link network figures in matplotlib and TikZ.',
      bodyZh: '一个持续生长的个人展示总集：在这里我练习各种有表现力、甚至带点新意的地理空间科研可视化——既包括可视化类型，也包括配色——目的是让科研结果被更有代表性地表达出来，并最终应用到真实的科研成果中。目前已有五篇：R/ggcube 三维图；Python 环形棒棒糖与分类热图混合体；城市设施公平的小提琴 + 相关 + 气泡组合图；PlotNeuralNet 声明式 CNN/U-Net 架构图；以及 matplotlib 与 TikZ 双轨的经典节点-连线网络图。',
      link: 'https://coldzera-010825.github.io/gis/gallery',
      linkLabel: 'Open the Visual Gallery (Geobook)',
      linkLabelZh: '打开可视化展示馆（Geobook）',
      details: {
        hero: './assets/fig/projects/09-ggcube-dem.png',
        tagline: {
          en: 'An evolving collection of geospatial research-visualization experiments — visualization types and colour palettes practiced now, to be applied to real research later. Five pieces so far: 3D figures with ggcube, a circular lollipop-heatmap hybrid, a facility-equity residual diagnostic, declarative CNN/U-Net architecture diagrams, and node-link network figures in matplotlib + TikZ.',
          zh: '一个不断演进的地理空间科研可视化实验集——现在练习可视化类型与配色，未来应用到真实科研中。目前已有五篇：ggcube 三维图、环形棒棒糖热图混合体、设施公平残差诊断图、声明式 CNN/U-Net 架构图，以及 matplotlib + TikZ 的节点-连线网络图。',
        },
        sections: [
          {
            heading: { en: 'The idea', zh: '缘起' },
            body: {
              en: 'Good science deserves visuals that actually carry the result. This project is my personal lab for that — a place to try visualization types and colour schemes that are not just correct but representative and memorable, before they earn a place in a paper or a report. The emphasis is practice: building a vocabulary of techniques I can reach for when a real dataset needs to speak clearly.',
              zh: '好的研究值得能真正承载结果的图。这个项目就是我为此设立的个人实验场——在某种图表或配色进入论文或报告之前，先在这里尝试那些不仅正确、而且更具代表性、更令人印象深刻的可视化类型与配色方案。重点在于"练习"：积累一套技法词汇，等真实数据需要清晰表达时随手可用。',
            },
          },
          {
            heading: { en: 'Piece 01 · 3D visualization with ggcube', zh: '第一篇 · ggcube 三维可视化' },
            body: {
              en: 'The first entry explores three dimensions with the R package ggcube, which extends ggplot2 via coord_3d() and geom_*_3d(). It rebuilds five figure types — 3D scatter, a four-variable scatter, a simulated DEM surface with hillshade lighting, 3D bars, and a space–time propagation path — encoding space, time and intensity together. The full walkthrough, code and palettes live in the linked report.',
              zh: '第一篇用 R 包 ggcube 探索三维——它通过 coord_3d() 与 geom_*_3d() 扩展 ggplot2。复刻了五种图：3D 散点、四变量散点、带地形晕渲的模拟 DEM 曲面、3D 柱状，以及空间—时间传播路径，把空间、时间与强度一起编码。完整讲解、代码与配色都在所链接的报告里。',
            },
            figure: {
              src: './assets/fig/projects/09-ggcube-dem.png',
              caption: {
                en: 'Piece 01 — a simulated DEM surface (geom_surface_3d + light hillshading), one of five 3D figures in the ggcube report.',
                zh: '第一篇 —— 模拟 DEM 曲面（geom_surface_3d + 光照晕渲），是 ggcube 报告里五张三维图之一。',
              },
            },
            link: {
              url: './assets/reports/ggcube-3d-viz.html',
              en: 'Read the full tutorial · 3D with ggcube',
              zh: '阅读完整教程 · ggcube 三维可视化',
            },
          },
          {
            heading: { en: 'Piece 02 · Circular lollipop + categorical heatmap', zh: '第二篇 · 环形棒棒糖图 + 分类热图' },
            body: {
              en: 'Piece 02 moves to Python and matplotlib: 64 samples wrap around a shared polar axis — three continuous variables (age, education, plot area) as outer lollipop rings, two categorical variables (training, machinery) as inner heatmap rings — with box-plot and stacked-bar summaries docked at the side. One figure carries what would otherwise take five separate panels, a compact fit for survey and household data where every sample mixes numeric and categorical attributes. The same script renders eight alternative palettes — the seed of the palette studies to come.',
              zh: '第二篇转向 Python 与 matplotlib：64 个样本环绕同一极坐标轴——三个连续变量（年龄、受教育年限、地块面积）作为外圈棒棒糖环，两个分类变量（是否参加培训、机械数量）作为内圈热图环，侧边还停靠着箱线图与堆叠条形的汇总。一张图承载了原本需要五个面板的信息，非常适合问卷/农户调查这类每个样本同时携带数值与分类属性的数据。同一脚本还输出了八套备选配色——正是后续配色研究的种子。',
            },
            figure: {
              src: './assets/reports/outputs/circular_lollipop_heatmap/circular_lollipop_heatmap.png',
              caption: {
                en: 'Piece 02 — five data rings on one polar axis: three lollipop rings for continuous variables, two heatmap rings for categorical ones, with marginal summaries.',
                zh: '第二篇 —— 同一极坐标轴上的五个数据环：三个连续变量棒棒糖环 + 两个分类热图环，外加边际汇总。',
              },
            },
            link: {
              url: 'https://coldzera-010825.github.io/gis/circular-lollipop',
              en: 'Read the full tutorial · code walkthrough + 8 palettes (Geobook)',
              zh: '阅读完整教程 · 代码拆解 + 8 套配色（Geobook）',
            },
          },
          {
            heading: { en: 'Piece 03 · Facility-equity residual diagnostics', zh: '第三篇 · 设施公平残差诊断图' },
            body: {
              en: 'Piece 03 is a research-grade composite: facility-provision residuals for 339 cities across ten amenity types (education, healthcare, parks, transit…). Violin plots show each facility\'s residual distribution, a Spearman correlation matrix reveals which amenities over- or under-provide together, and a sign-log bubble matrix pinpoints city-level anomalies. It is exactly the kind of figure my environmental-justice work calls for — who gets more than expected, who gets less, and where.',
              zh: '第三篇是一张接近论文级的组合图：339 个城市 × 10 类设施（教育、医疗、公园、公交……）的供给残差。小提琴图展示每类设施的残差分布，Spearman 相关矩阵揭示哪些设施倾向于同涨同落，符号对数变换的气泡矩阵则精确定位城市级异常。这正是我的环境公平研究需要的图——谁获得的超出预期、谁不足，以及在哪里。',
            },
            figure: {
              src: './assets/reports/outputs/facility_residual_visualization/facility_residual_visualization.png',
              caption: {
                en: 'Piece 03 — violin distributions, a Spearman correlation matrix and a city × facility bubble matrix, composed into one residual diagnostic.',
                zh: '第三篇 —— 小提琴分布、Spearman 相关矩阵与城市 × 设施气泡矩阵，合成一张残差诊断图。',
              },
            },
            link: {
              url: 'https://coldzera-010825.github.io/gis/facility-residuals',
              en: 'Read the full tutorial · three panels, one GridSpec (Geobook)',
              zh: '阅读完整教程 · 三块面板一张 GridSpec（Geobook）',
            },
          },
          {
            heading: { en: 'Piece 04 · Neural-network architecture diagrams', zh: '第四篇 · 神经网络架构图' },
            body: {
              en: 'Piece 04 turns architecture figures into code: with PlotNeuralNet, a CNN or U-Net is declared as a Python list of layer primitives, emitted as LaTeX/TikZ, and compiled by pdflatex into the crisp 3D-slab vector style seen in CVPR/NeurIPS papers. The tutorial builds a full U-Net in three steps — a minimal five-layer chain, a repeatable encoder motif, then bottleneck, decoder and skip connections — exactly the diagrams my remote-sensing segmentation work needs.',
              zh: '第四篇把架构图变成代码：用 PlotNeuralNet，一个 CNN 或 U-Net 被声明为 Python 图层列表，生成 LaTeX/TikZ，由 pdflatex 编译成 CVPR/NeurIPS 论文里那种清晰的 3D 板块矢量风格。教程分三步搭出完整 U-Net——五层极简链、可重复的编码器基元、再到瓶颈 + 解码器 + 跳连——正是我遥感分割研究需要的那类图。',
            },
            figure: {
              src: './assets/fig/projects/09-nn-unet.jpg',
              caption: {
                en: 'Piece 04 — a U-Net declared in ~40 lines of Python, rendered by LaTeX/TikZ: encoder, bottleneck, decoder and skip connections.',
                zh: '第四篇 —— 约 40 行 Python 声明、LaTeX/TikZ 渲染的 U-Net：编码器、瓶颈、解码器与跳连。',
              },
            },
            link: {
              url: 'https://coldzera-010825.github.io/gis/neural-net-diagrams',
              en: 'Read the full tutorial · declarative NN diagrams (Geobook)',
              zh: '阅读完整教程 · 声明式神经网络架构图（Geobook）',
            },
          },
          {
            heading: { en: 'Piece 05 · Node-link network figures', zh: '第五篇 · 节点-连线网络图' },
            body: {
              en: 'The sister of Piece 04: the classic neurons-and-edges MLP figure, built twice — from scratch in matplotlib (edge colour = weight sign, thickness = magnitude) and in publication-grade TikZ with the same loop grammar. The tutorial closes with honest tooling advice: when a one-off draft is all you need, the browser tool NN-SVG wins.',
              zh: '第四篇的姊妹篇：经典的神经元圆圈 + 层间连线 MLP 图，用两套工具各搭一遍——matplotlib 从零构建（边色 = 权重符号、线宽 = 量级），以及同一循环语法的出版级 TikZ 版本。教程结尾给出实诚的工具建议：只需要一次性草图时，浏览器工具 NN-SVG 更快。',
            },
            figure: {
              src: './assets/fig/projects/09-nl-mlp.jpg',
              caption: {
                en: 'Piece 05 — a 4-6-6-3 MLP in pure matplotlib: weight-encoded edges (blue positive, orange negative; thickness = magnitude).',
                zh: '第五篇 —— 纯 matplotlib 绘制的 4-6-6-3 MLP：权重编码边（蓝正橙负，线宽 = 量级）。',
              },
            },
            link: {
              url: 'https://coldzera-010825.github.io/gis/node-link-networks',
              en: 'Read the full tutorial · node-link figures, two toolchains (Geobook)',
              zh: '阅读完整教程 · 节点-连线图双轨实现（Geobook）',
            },
          },
          {
            heading: { en: 'Where this is heading', zh: '接下来' },
            body: {
              en: 'Next up: dedicated palette studies — the eight colour schemes shipped with Piece 02 are the opening move — alongside bivariate and small-multiple choropleths, flow and origin–destination maps, ridgelines and animated time series, all chosen for perceptual honesty. Every technique here is rehearsal — the goal is to apply the strongest of them to my actual geospatial research output.',
              zh: '接下来：专门的配色研究——第二篇随脚本交付的八套配色方案就是开篇——以及双变量与小多组分级设色图、流向 / OD 地图、山脊线图与动画时间序列，一律以感知诚实为准则挑选。这里的每一种技法都是排练，最终目的是把其中最有力的，用到我真实的地理空间科研成果中。',
            },
            figure: {
              src: './assets/fig/projects/09-ggcube-path.png',
              caption: {
                en: 'A space–time propagation path from Piece 01 — the kind of representation this showcase collects and refines.',
                zh: '第一篇中的空间—时间传播路径——正是这个展示集所收集与打磨的表达方式。',
              },
            },
          },
        ],
        bullets: [
          { en: 'A personal, growing showcase of geospatial research-visualization techniques', zh: '一个持续生长的地理空间科研可视化技法个人展示集' },
          { en: 'Focus on both visualization types and colour palettes', zh: '同时关注可视化类型与配色方案' },
          { en: 'Piece 01: 3D figures in R with ggcube (scatter · surface · bars · path)', zh: '第一篇：用 R 的 ggcube 绘制三维图（散点 · 曲面 · 柱状 · 路径）' },
          { en: 'Piece 02: circular lollipop + categorical heatmap in Python, with 8 palette variants', zh: '第二篇：Python 环形棒棒糖图 + 分类热图，附 8 套配色变体' },
          { en: 'Piece 03: violin + correlation + bubble composite for urban facility equity (339 cities × 10 amenities)', zh: '第三篇：小提琴 + 相关 + 气泡组合图，呈现城市设施公平（339 城市 × 10 类设施）' },
          { en: 'Piece 04: declarative U-Net / CNN architecture diagrams with PlotNeuralNet (Python → LaTeX/TikZ)', zh: '第四篇：用 PlotNeuralNet 声明式绘制 U-Net / CNN 架构图（Python → LaTeX/TikZ）' },
          { en: 'Piece 05: node-link MLP figures in matplotlib + TikZ, with weight-encoded edges', zh: '第五篇：matplotlib + TikZ 双轨的节点-连线 MLP 图，边携带权重编码' },
          { en: 'Next: dedicated palette studies, thematic and animated pieces', zh: '接下来：专门的配色研究与更多专题、动画篇目' },
        ],
        sourceUrl: 'https://coldzera-010825.github.io/gis/gallery',
        sourceLabel: { en: 'Open the Visual Gallery on my Geobook', zh: '在我的 Geobook 上打开可视化展示馆' },
      },
    },
  ];

  function attr(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  function pick(en, zh) {
    const I = window.PW_I18N;
    return I && I.lang === 'zh' ? (zh != null ? zh : en) : en;
  }

  function makeSlide(p, i) {
    const slide = document.createElement('section');
    slide.className = 'proj-page';
    slide.id = `proj-${p.n}`;
    slide.dataset.idx = String(i);
    slide.style.setProperty('--proj-accent', p.accent);
    slide.style.setProperty('--proj-accent-soft', p.accentSoft);
    slide.setAttribute('role', 'button');
    slide.setAttribute('tabindex', '0');
    slide.setAttribute('aria-label', `Open project ${p.n}: ${p.title}`);
    slide.setAttribute('data-i18n-attr-en', `aria-label:Open project ${p.n}: ${p.title}`);
    slide.setAttribute('data-i18n-attr-zh', `aria-label:展开项目 ${p.n}：${p.titleZh}`);

    const linkBlock = p.link
      ? `<a class="proj-page-source" href="${p.link}" target="_blank" rel="noopener" data-no-open
            data-i18n-en="${attr(p.linkLabel + ' \u2197')}"
            data-i18n-zh="${attr(p.linkLabelZh + ' \u2197')}">${pick(p.linkLabel, p.linkLabelZh)} \u2197</a>`
      : '';
    const heroSrc = p.details && p.details.hero ? p.details.hero : '';
    const coverHtml = heroSrc
      ? `<img class="proj-page-cover" src="${attr(heroSrc)}" alt="" loading="lazy" decoding="async"
              onerror="this.style.display='none'"/>`
      : '';

    slide.innerHTML = `
      <div class="proj-page-grid">
        <div class="proj-page-copy">
          <div class="proj-page-num">${p.n}</div>
          <div class="proj-page-zh"
               data-i18n-en="${attr(p.zh)}"
               data-i18n-zh="${attr(p.zhEn)}">${pick(p.zh, p.zhEn)}</div>
          <h2 class="proj-page-title"
              data-i18n-en="${attr(p.title)}"
              data-i18n-zh="${attr(p.titleZh)}">${pick(p.title, p.titleZh)}</h2>
          <div class="proj-page-rule"></div>
          <p class="proj-page-body"
             data-i18n-en="${attr(p.body)}"
             data-i18n-zh="${attr(p.bodyZh)}">${pick(p.body, p.bodyZh)}</p>
          <div class="proj-page-actions">
            <span class="proj-page-open"
                  data-i18n-en="Open full project \u2192"
                  data-i18n-zh="\u5C55\u5F00\u5B8C\u6574\u9879\u76EE \u2192">${pick('Open full project \u2192', '\u5C55\u5F00\u5B8C\u6574\u9879\u76EE \u2192')}</span>
            ${linkBlock}
          </div>
        </div>
        <div class="proj-page-visual">
          <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" class="proj-page-pattern" aria-hidden="true">
            <defs>
              <pattern id="ppat-${p.n}" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M32 0H0V32" fill="none" stroke="${p.accent}" stroke-opacity="0.18" stroke-width="0.5"/>
              </pattern>
              <radialGradient id="pglow-${p.n}" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stop-color="${p.accent}" stop-opacity="0.32"/>
                <stop offset="100%" stop-color="${p.accent}" stop-opacity="0"/>
              </radialGradient>
            </defs>
            <rect width="400" height="500" fill="${p.accentSoft}"/>
            <rect width="400" height="500" fill="url(#ppat-${p.n})"/>
            <rect width="400" height="500" fill="url(#pglow-${p.n})"/>
          </svg>
          ${coverHtml}
          <span class="proj-page-step">${String(i + 1).padStart(2, '0')} / ${String(PROJECTS.length).padStart(2, '0')}</span>
        </div>
      </div>
    `;

    const openIfNotLink = (e) => {
      if (e.target && e.target.closest && e.target.closest('a, [data-no-open]')) return;
      e.preventDefault();
      openProjectModal(p, slide);
    };
    slide.addEventListener('click', openIfNotLink);
    slide.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') openIfNotLink(e);
    });
    return slide;
  }

  const stack = document.getElementById('projects-stack');
  const rail  = document.getElementById('projects-rail');
  if (!stack) return;

  const pages = PROJECTS.map((p, i) => {
    const el = makeSlide(p, i);
    stack.appendChild(el);
    return el;
  });

  // Side-rail dots: number + on-hover title preview
  const railDots = PROJECTS.map((p, i) => {
    const a = document.createElement('a');
    a.href = `#proj-${p.n}`;
    a.className = 'proj-rail-dot';
    a.setAttribute('aria-label', `Project ${i + 1}: ${p.title}`);
    a.setAttribute('data-i18n-attr-en', `aria-label:Project ${i + 1}: ${p.title}`);
    a.setAttribute('data-i18n-attr-zh', `aria-label:项目 ${i + 1}：${p.titleZh}`);
    a.innerHTML = `
      <span class="proj-rail-num">${p.n}</span>
      <span class="proj-rail-label"
            data-i18n-en="${attr(p.title)}"
            data-i18n-zh="${attr(p.titleZh)}">${pick(p.title, p.titleZh)}</span>
    `;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      pages[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    rail.appendChild(a);
    return a;
  });

  // Scroll-sync side rail with active page
  const pageIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const idx = pages.indexOf(e.target);
        if (idx === -1) return;
        railDots.forEach((d, j) => d.classList.toggle('is-active', j === idx));
        pages.forEach((pg, j) => pg.classList.toggle('is-active', j === idx));
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );
  pages.forEach((pg) => pageIO.observe(pg));

  // Keyboard navigation: ↑/↓ jump to prev/next page (only when no modal open)
  let activeIdx = 0;
  function onKeyNav(e) {
    if (activeProject) return;
    if (e.target && e.target.closest && e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      const next = Math.min(pages.length - 1, activeIdx + 1);
      if (next !== activeIdx) {
        e.preventDefault();
        pages[next].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      const prev = Math.max(0, activeIdx - 1);
      if (prev !== activeIdx) {
        e.preventDefault();
        pages[prev].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
  // Track which is active for keyboard nav
  const activeIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const idx = pages.indexOf(e.target);
          if (idx !== -1) activeIdx = idx;
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );
  pages.forEach((pg) => activeIO.observe(pg));
  document.addEventListener('keydown', onKeyNav);

  // ---------- FLIP-style project detail modal ----------
  let activeProject = null;

  function buildModalContent(p) {
    const d = p.details;
    const placeholder = !d;
    // Backdrop: a faded, full-bleed image (or accent-coloured pattern) sitting
    // behind the content. It never takes up its own layout space — the modal
    // copy reads on top of it.
    const heroHtml = `<div class="project-modal-backdrop"
              data-hero-src="${d && d.hero ? attr(d.hero) : ''}"
              style="--accent:${p.accent}; --accent-soft:${p.accentSoft}; background-color:${p.accentSoft};">
           <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" class="project-modal-backdrop-pattern">
             <defs>
               <pattern id="mpat-${p.n}" width="40" height="40" patternUnits="userSpaceOnUse">
                 <path d="M40 0H0V40" fill="none" stroke="${p.accent}" stroke-opacity="0.22" stroke-width="0.5"/>
               </pattern>
               <radialGradient id="mglow-${p.n}" cx="50%" cy="55%" r="60%">
                 <stop offset="0%" stop-color="${p.accent}" stop-opacity="0.35"/>
                 <stop offset="100%" stop-color="${p.accent}" stop-opacity="0"/>
               </radialGradient>
             </defs>
             <rect width="400" height="250" fill="${p.accentSoft}"/>
             <rect width="400" height="250" fill="url(#mpat-${p.n})"/>
             <rect width="400" height="250" fill="url(#mglow-${p.n})"/>
           </svg>
           <div class="project-modal-backdrop-num" aria-hidden="true">${p.n}</div>
         </div>`;

    const sectionsHtml = d && d.sections && d.sections.length
      ? d.sections.map((s) => {
          const figHtml = s.figure
            ? `<figure class="project-modal-figure" data-fig-src="${attr(s.figure.src)}" style="display:none;">
                 <img alt="" loading="lazy"/>
                 ${s.figure.caption ? `<figcaption class="project-modal-figcaption"
                       data-i18n-en="${attr(s.figure.caption.en)}"
                       data-i18n-zh="${attr(s.figure.caption.zh)}">${pick(s.figure.caption.en, s.figure.caption.zh)}</figcaption>` : ''}
               </figure>`
            : '';
          const linkHtml = s.link
            ? `<p style="margin-top:10px;"><a class="project-modal-source" href="${attr(s.link.url)}" target="_blank" rel="noopener"
                  data-i18n-en="${attr(s.link.en + ' ↗')}"
                  data-i18n-zh="${attr(s.link.zh + ' ↗')}">${pick(s.link.en, s.link.zh)} ↗</a></p>`
            : '';
          return `
            <section class="project-modal-section">
              <h3 class="project-modal-h3"
                  data-i18n-en="${attr(s.heading.en)}"
                  data-i18n-zh="${attr(s.heading.zh)}">${pick(s.heading.en, s.heading.zh)}</h3>
              <p class="project-modal-p"
                 data-i18n-en="${attr(s.body.en)}"
                 data-i18n-zh="${attr(s.body.zh)}">${pick(s.body.en, s.body.zh)}</p>
              ${figHtml}
              ${linkHtml}
            </section>`;
        }).join('')
      : `<p class="project-modal-p project-modal-soon"
            data-i18n-en="A detailed write-up for this project is on its way."
            data-i18n-zh="本项目的详细介绍正在整理中。">${pick('A detailed write-up for this project is on its way.', '本项目的详细介绍正在整理中。')}</p>`;

    const bulletsHtml = d && d.bullets && d.bullets.length
      ? `<ul class="project-modal-bullets">
           ${d.bullets.map((b) => `<li
              data-i18n-en="${attr(b.en)}"
              data-i18n-zh="${attr(b.zh)}">${pick(b.en, b.zh)}</li>`).join('')}
         </ul>`
      : '';

    const sourceUrl = (d && d.sourceUrl) || p.link;
    const sourceLabelEn = (d && d.sourceLabel && d.sourceLabel.en) || (p.linkLabel ? p.linkLabel + ' ↗' : '');
    const sourceLabelZh = (d && d.sourceLabel && d.sourceLabel.zh) || (p.linkLabelZh ? p.linkLabelZh + ' ↗' : '');
    const sourceHtml = sourceUrl
      ? `<p style="margin-top:34px;">
           <a class="project-modal-source" href="${attr(sourceUrl)}" target="_blank" rel="noopener"
              data-i18n-en="${attr(sourceLabelEn + ' ↗')}"
              data-i18n-zh="${attr(sourceLabelZh + ' ↗')}">${pick(sourceLabelEn, sourceLabelZh)} ↗</a>
         </p>`
      : '';

    const taglineHtml = d && d.tagline
      ? `<p class="project-modal-tagline"
            data-i18n-en="${attr(d.tagline.en)}"
            data-i18n-zh="${attr(d.tagline.zh)}">${pick(d.tagline.en, d.tagline.zh)}</p>`
      : `<p class="project-modal-tagline"
            data-i18n-en="${attr(p.body)}"
            data-i18n-zh="${attr(p.bodyZh)}">${pick(p.body, p.bodyZh)}</p>`;

    return `
      ${heroHtml}
      <button type="button" class="research-modal-close" aria-label="Close"
              data-i18n-attr-en="aria-label:Close"
              data-i18n-attr-zh="aria-label:关闭">
        <span data-i18n-en="Close" data-i18n-zh="关闭">${pick('Close', '关闭')}</span>
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" stroke-width="1"/>
          <line x1="12" y1="2" x2="2" y2="12" stroke="currentColor" stroke-width="1"/>
        </svg>
      </button>
      <div class="pw-research-modal-inner project-modal-inner">
        <div class="project-modal-kicker"
             data-i18n-en="Project ${p.n}"
             data-i18n-zh="项目 ${p.n}">${pick('Project ' + p.n, '项目 ' + p.n)}</div>
        <h2 class="project-modal-title"
            data-i18n-en="${attr(p.title)}"
            data-i18n-zh="${attr(p.titleZh)}">${pick(p.title, p.titleZh)}</h2>
        <div class="modal-rule"></div>
        ${taglineHtml}
        ${sectionsHtml}
        ${bulletsHtml}
        ${sourceHtml}
        ${placeholder ? `<p class="project-modal-meta"
              data-i18n-en="More documentation and figures will appear here soon."
              data-i18n-zh="更多文档与图示稍后补充于此。">${pick('More documentation and figures will appear here soon.', '更多文档与图示稍后补充于此。')}</p>` : ''}
      </div>
    `;
  }

  function openProjectModal(p, slideEl) {
    if (activeProject) return;
    const rect = slideEl.getBoundingClientRect();

    const overlay = document.createElement('div');
    overlay.className = 'research-modal-overlay project-modal-overlay';

    const frame = document.createElement('div');
    frame.className = 'pw-research-modal-frame project-modal-frame';
    frame.style.cssText = `
      position: fixed;
      top: ${rect.top}px; left: ${rect.left}px;
      width: ${rect.width}px; height: ${rect.height}px;
      background: ${p.accentSoft};
      transition: top 620ms var(--ease), left 620ms var(--ease),
                  width 620ms var(--ease), height 620ms var(--ease);
    `;
    frame.innerHTML = buildModalContent(p);

    document.body.appendChild(overlay);
    document.body.appendChild(frame);
    document.body.style.overflow = 'hidden';

    // Force layout, then animate to fullscreen.
    void frame.offsetHeight;
    requestAnimationFrame(() => {
      overlay.classList.add('is-open');
      frame.classList.add('is-full');
      frame.style.top = '0px';
      frame.style.left = '0px';
      frame.style.width = '100vw';
      frame.style.height = '100vh';
    });

    setTimeout(() => {
      frame.classList.add('is-ready');
    }, 320);

    activeProject = { p, slideEl, frame, overlay, rect };

    overlay.addEventListener('click', closeProjectModal);
    frame.querySelector('.research-modal-close').addEventListener('click', closeProjectModal);
    document.addEventListener('keydown', onKey);

    // Preload hero — only swap in real image if it actually loads.
    const heroEl = frame.querySelector('.project-modal-backdrop');
    const heroSrc = heroEl && heroEl.getAttribute('data-hero-src');
    if (heroEl && heroSrc) {
      const img = new Image();
      img.onload = () => {
        heroEl.style.backgroundImage = `url('${heroSrc}')`;
        heroEl.classList.add('has-image');
      };
      img.onerror = () => { /* keep placeholder */ };
      img.src = heroSrc;
    }
    // Preload inline figures — reveal only on successful load.
    frame.querySelectorAll('.project-modal-figure[data-fig-src]').forEach((fig) => {
      const src = fig.getAttribute('data-fig-src');
      const imgEl = fig.querySelector('img');
      if (!src || !imgEl) return;
      const probe = new Image();
      probe.onload = () => {
        imgEl.src = src;
        fig.style.display = '';
      };
      probe.onerror = () => { /* leave hidden */ };
      probe.src = src;
    });

    document.dispatchEvent(new CustomEvent('pw-i18n-refresh'));
  }

  function onKey(e) {
    if (e.key === 'Escape') closeProjectModal();
  }

  function closeProjectModal() {
    if (!activeProject) return;
    const { slideEl, frame, overlay } = activeProject;
    const rect = slideEl.getBoundingClientRect();

    frame.classList.remove('is-ready');
    frame.classList.remove('is-full');
    overlay.classList.remove('is-open');

    frame.style.top = rect.top + 'px';
    frame.style.left = rect.left + 'px';
    frame.style.width = rect.width + 'px';
    frame.style.height = rect.height + 'px';

    document.removeEventListener('keydown', onKey);

    setTimeout(() => {
      overlay.remove();
      frame.remove();
      document.body.style.overflow = '';
      activeProject = null;
    }, 640);
  }

  // Let i18n.js apply current language to the freshly injected slides.
  document.dispatchEvent(new CustomEvent('pw-i18n-refresh'));
})();
