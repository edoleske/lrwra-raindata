// Create the Map
// **************************************
require([
    'esri/WebMap',
    'esri/views/MapView',
    'esri/widgets/Home',
    'esri/rest/support/Query',
    'esri/layers/FeatureLayer',
  ], function (WebMap, MapView, Home, Query, FeatureLayer) {
    // Map object
    const webmap = new WebMap({
      portalItem: {
        id: 'ea3ff211ed8c484aaf48b81303e79b4f',
        portal: 'https://gis.lrwu.com/portal',
      },
    });
  
    const fLayer = new FeatureLayer({
      url: 'https://gis.lrwu.com/server/rest/services/RainGauges/Rain/FeatureServer/72',
    });
  
    // MapView Object
    const view = new MapView({
      container: 'viewDiv',
      map: webmap,
      zoom: 11,
      center: [-92.356121, 34.737015],
      constraints: {
        minZoom: 10,
        maxZoom: 16,
        snapToZoom: false,
      },
      logo: false,
    });
  
    // Create Home button object
    const home = new Home({
      view: view,
    });
  
    //* Add the home button to the view
    view.ui.add(home, 'top-left');
    view.ui.move(['zoom'], 'top-left');
  
    // Create the chart for the rain gauges.
    // **************************************
    //TODO: Get data from rain gauge layer REST
    async function getRainValue(tag) {
      let query = fLayer.createQuery();
      let value;
      query.where = `TAG = '${tag}'`;
      query.outFields = ['VALUE'];
      returnGeometry = false;
      const queryResult = await fLayer.queryFeatures(query);
      for (let feat of queryResult.features) {
        value = feat.getAttribute('VALUE');
        return value.toFixed(2);
      }
    }
  
    const gaugeLabels = [
      'ADAMS.TS1941CAT.F_CV',
      'ADAMS.AS1941CAT.F_CV',
      'ADAMS.AS1941CAT.F_CV',
      'ADAMS.CR1941LQT.F_CV',
      'ADAMS.CM1942CAT.F_CV',
      'ADAMS.CV1942CAT.F_CV',
      'ADAMS.CAB2295LQT.F_CV',
      'ADAMS.CP1942CAT.F_CV',
      'FOURCHE.FC2295LQT.F_CV',
      'ADAMS.HR1942CAT.F_CV',
      'ADAMS.JR1941CAT.F_CV',
      'ADAMS.LF1941CAT.F_CV',
      'MAUMELLE.LM1941CAT.F_CV',
      'ADAMS.OC1941CAT.F_CV',
      'ADAMS.PF2295LQT.F_CV',
      'ADAMS.RR1942CAT.F_CV',
      'ADAMS.SW1942CAT.F_CV',
      'ADAMS.SD1942CAT.F_CV',
      'ADAMS.WH1942CAT.F_CV',
    ];
    const gaugeData = [];
    gaugeLabels.forEach((label) => {
      getRainValue(label)
        .then((results) => {
          gaugeData.push(results);
        })
        .catch((error) => console.log(error));
    });
  
    console.log(gaugeData);
  
    // placing the funtion in the array doesn't work
    // ********************************************* 
    // const gaugeData = [
    //   getRainValue('ADAMS.TS1941CAT.F_CV'),
    //   getRainValue('ADAMS.AS1941CAT.F_CV'),
    //   getRainValue('ADAMS.AS1941CAT.F_CV'),
    //   getRainValue('ADAMS.CR1941LQT.F_CV'),
    //   getRainValue('ADAMS.CM1942CAT.F_CV'),
    //   getRainValue('ADAMS.CV1942CAT.F_CV'),
    //   getRainValue('ADAMS.CAB2295LQT.F_CV'),
    //   getRainValue('ADAMS.CP1942CAT.F_CV'),
    //   getRainValue('FOURCHE.FC2295LQT.F_CV'),
    //   getRainValue('ADAMS.HR1942CAT.F_CV'),
    //   getRainValue('ADAMS.JR1941CAT.F_CV'),
    //   getRainValue('ADAMS.LF1941CAT.F_CV'),
    //   getRainValue('MAUMELLE.LM1941CAT.F_CV'),
    //   getRainValue('ADAMS.OC1941CAT.F_CV'),
    //   getRainValue('ADAMS.PF2295LQT.F_CV'),
    //   getRainValue('ADAMS.RR1942CAT.F_CV'),
    //   getRainValue('ADAMS.SW1942CAT.F_CV'),
    //   getRainValue('ADAMS.SD1942CAT.F_CV'),
    //   getRainValue('ADAMS.WH1942CAT.F_CV'),
    // ];
  
    // Setting the bar color propery based on value-- Doesn't work
    // ************************************************************* 
    // const bgColor = [];
    // for (i = 0; i < gaugeData.length; i++) {
    //   console.log(gaugeData[i]);
    //   //* Blue bar
    //   if (gaugeData[i] < 1) {
    //     bgColor.push('rgb(49, 133, 255, 1)');
    //   }
    //   //* Yellow bar
    //   if (gaugeData[i] >= 1 && gaugeData[i] < 2) {
    //     bgColor.push('rgb(254, 255, 115, 1)');
    //   }
    //   //* Orange bar
    //   if (gaugeData[i] >= 2 && gaugeData[i] < 3) {
    //     bgColor.push('rgb(248, 170, 3, 1)');
    //   }
    //   //* Red bar
    //   if (gaugeData[i] >= 3 && gaugeData[i] < 4) {
    //     bgColor.push('rgb(244, 3, 3, 1)');
    //   }
    // }
  
    const data = {
      labels: [
        '36th St',
        'Adams',
        'Arch',
        'Cantrell',
        'Chalamont',
        'Chenal',
        'CAB',
        'Copper Run',
        'Fourche',
        'Heinke',
        'Jamison',
        'Longfellow',
        'Maumelle',
        'Otter Crk',
        'Peak Flow',
        'River Ridge',
        'Slackwater',
        'Springer',
        'Walton Hts',
      ],
      datasets: [
        {
          label: 'Accumulation',
          data: gaugeData,
          borderWidth: 1,
          backgroundColor: 'rgb(49, 133, 255, 1)',
        },
      ],
    };
  
    // Config
    // ********************
    const config = {
      type: 'bar',
      data: data,
      options: {
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Starting at 12:00 AM today.',
            color: '#FFFFFF',
          },
          datalabels: {
            color: '#FFFFFF',
            align: 'end',
            anchor: 'end',
            offset: 2,
          },
        },
        indexAxis: 'y',
        color: '#FFFFFF',
        hoverBackgroundColor: 'white',
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgb(126, 126, 126, .1)',
              // borderColor: 'white',
              tickColor: 'transparent',
            },
            title: {
              display: true,
              text: 'Location',
              color: '#FFFFFF',
            },
            ticks: {
              callback: function (value, index, values) {
                return `${this.chart.data.labels[index]}`;
              },
              color: '#FFFFFF',
            },
          },
          x: {
            min: 0.01,
            max: 4,
            grid: {
              color: 'rgb(126, 126, 126, .7)',
              // borderColor: 'rgb(126, 126, 126, 1)',
              tickColor: 'transparent',
            },
            title: {
              display: true,
              text: 'Accumulation (Inches)',
              color: '#FFFFFF',
            },
            ticks: {
              callback: (value, index, values) => {
                return `${index}"`;
              },
              color: '#FFFFFF',
            },
            color: '#FFFFFF',
          },
        },
      },
      plugins: [ChartDataLabels],
    };
  
    // Render
    // const chart = new Chart(document.getElementById('rainChart'), config);
    new Chart(document.getElementById('rainChart'), config);
  });
  