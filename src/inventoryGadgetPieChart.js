if (typeof UPTIME == "undefined") {
    var UPTIME = {};
}

if (typeof UPTIME.InventoryGadgetPieChart == "undefined") {
    UPTIME.InventoryGadgetPieChart = function(options, displayStatusBar, clearStatusBar) {
        Highcharts.setOptions({
            global : {
                useUTC : false
            }
        });

        var dimensions = new UPTIME.pub.gadgets.Dimensions(100, 100);
        var chartDivId = null;
        var elementId = null;
        var chartType = null;
        var refreshInterval = 30;
        var chartTimer = null;
        var api = new apiQueries();

        var textStyle = {
            fontFamily : "Verdana, Arial, Helvetica, sans-serif",
            fontSize : "9px",
            lineHeight : "11px",
            color : "#565E6C"
        };

        if (typeof options == "object") {
            dimensions = options.dimensions;
            chartDivId = options.chartDivId;
            chartType = options.chartType;
            elementId = options.elementId;
            refreshInterval = options.refreshInterval;
        }



        var dataLabelsEnabled = false;
        var chart = new Highcharts.Chart({
            chart: {
                        renderTo: chartDivId,
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false
                    },
                    title: {
                        text: 'Iventory Breakdown'
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: true,
                                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                                style: {
                                    color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                                }
                            }
                        }
                    },
                    series: [{
                        type: 'pie',
                        name: 'Browser share',
                        data: [
                            ['Firefox',   45.0],
                            ['IE',       26.8],
                            {
                                name: 'Chrome',
                                y: 12.8,
                                sliced: true,
                                selected: true
                            },
                            ['Safari',    8.5],
                            ['Opera',     6.2],
                            ['Others',   0.7]
                        ]
                    }]

        });

        function requestData() {
            api.getElementStatus(elementId).then(
                    function(result) {
                        if (!result.isMonitored) {
                            chart.hideLoading();
                            displayStatusBar("No visible elements to monitor", "Error Loading Chart Data");                     
                            return;
                        }                       
                        var statusCount = {
                            'OK' : 0,
                            'WARN' : 0,
                            'CRIT' : 0,
                            'UNKNOWN' : 0,
                            'MAINT' : 0
                        };
                        var total = 0;
                        $.each(result.monitorStatus, function(index, monitor) {
                            if (monitor.isMonitored && !monitor.isHidden) {
                                statusCount[monitor.status]++;
                                total++;
                            }
                        });
                        chart.setTitle({
                            text : '<a href="' + uptimeGadget.getElementUrls(result.id, result.name).services
                                    + '" target="_top">' + escapeHtml(result.name) + '</a>',
                        }, {
                            text : monitorCount(total),
                        });
                        $.each(statusCount, function(status, count) {
                            var bar = chart.get(status);
                            bar.setData([ count ]);
                            if (count > 0) {
                                bar.show();
                            } else {
                                bar.hide();
                            }
                        });
                        clearStatusBar();
                        dataLabelsEnabled = true;
                        chart.hideLoading();
                    }, function(error) {
                        chart.hideLoading();
                        displayStatusBar(error, "Error Loading Chart Data");
                    });
            if (refreshInterval > 0) {
                chartTimer = setTimeout(requestData, refreshInterval * 1000);
            }
        }

        // public functions for this function/class
        var publicFns = {
            render : function() {
                chart.showLoading();
                requestData();
            },
            resize : function(dimensions) {
                chart.setSize(dimensions.width, dimensions.height);
            },
            stopTimer : function() {
                if (chartTimer) {
                    window.clearTimeout(chartTimer);
                }
            },
            destroy : function() {
                chart.destroy();
            }
        };
        return publicFns; // Important: we need to return the public
        // functions/methods

    };
}