var categories = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
var chart_data = {
    "title": null,
    "subtitle": null,
    "series": null,
    "chart": { "type": "bar" },
    "xAxis": [ { title:{ text: "Rank" },"categories": categories, "reversed": false, "labels": { "step": 1 }},
                   { "categories": categories, "reversed": false, "labels":{ "step": 1 }, "opposite": true, "linkedTo": 0 }
             ],
    "yAxis": { "title": { "text": null }, "labels": { "formatter": function () { return Math.abs(this.value); } } },
    "plotOptions": { "series": { "stacking": "normal" } },
    "tooltip": { "formatter" : function () {
        return '<a href="https://metacpan.org/author/' +
               this.series.options.meta[this.key-1] + '">' +
               this.series.options.meta[this.key-1] +
               '</a><b> (' +
               Highcharts.numberFormat(Math.abs(this.point.y), 0) + ')</b>';
        }
    }
};

$(function() {
    $("#ds").click();
    $("#pr_2017").click();
    $("#prc_2017").click();
    $("#gc_2017").click();
    $("#cus").click();
    $("#ad").click();
});

$("#ds").click(function() {
    $('#cr-spinner').show();
    $.ajax({
        url: "/stats/daily",
        dataType: "JSON",
        success: function(data) {
            var daily_chart_data      = chart_data;
            daily_chart_data.title    = data.title;
            daily_chart_data.subtitle = data.subtitle;
            daily_chart_data.series   = data.series;
            $('#daily_stats').highcharts(daily_chart_data);
        },
        complete: function() {
            $('#cr-spinner').hide();

        }
    });
});

$("#ws").click(function() {
    $('#cr-spinner').show();
    $.ajax({
        url: "/stats/weekly",
        dataType: "JSON",
        success: function(data) {
            var weekly_chart_data      = chart_data;
            weekly_chart_data.title    = data.title;
            weekly_chart_data.subtitle = data.subtitle;
            weekly_chart_data.series   = data.series;
            $('#weekly_stats').highcharts(weekly_chart_data);
        },
        complete: function() {
            $('#cr-spinner').hide();
        }
    });
});

$("#ms").click(function() {
    $('#cr-spinner').show();
    $.ajax({
        url: "/stats/monthly",
        dataType: "JSON",
        success: function(data) {
            var monthly_chart_data      = chart_data;
            monthly_chart_data.title    = data.title;
            monthly_chart_data.subtitle = data.subtitle;
            monthly_chart_data.series   = data.series;
            $('#monthly_stats').highcharts(monthly_chart_data);
        },
        complete: function() {
            $('#cr-spinner').hide();
        }
    });
});

$("#cus").click(function() {
    $('#cu-spinner').show();
    $.ajax({
        url: "/cpan-uploaders/20",
        dataType: "JSON",
        success: function(data) {
            $('#cpan_uploaders_stats').highcharts(data);
        },
        complete: function() {
            $('#cu-spinner').hide();
        }
    });
});
$("#nus").click(function() {
    $('#cu-spinner').show();
    var categories = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
                      '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
    var chart_data = {
        "title": null,
     "subtitle": null,
       "series": null,
        "chart": { "type": "bar" },
        "xAxis": [ { title:{ text: "Rank" },"categories": categories, "reversed": false, "labels": { "step": 1 }},{ "categories": categories, "reversed": false, "labels":{ "step": 1 }, "opposite": true, "linkedTo": 0 }],
        "yAxis": { "title": { "text": null }, "labels": { "formatter": function () { return Math.abs(this.value); } } },
  "plotOptions": { "series": { "stacking": "normal" } },
      "tooltip": { "formatter" : function () {
                       return this.series.options.meta[this.key-1] +
                          '<b> (' +
                          Highcharts.numberFormat(Math.abs(this.point.y), 0) + ')</b>';
                    }
                 }
    };

    $.ajax({
        url: "/neocpan-uploaders/20",
        dataType: "JSON",
        success: function(data) {
            chart_data.title    = data.title;
            chart_data.subtitle = data.subtitle;
            chart_data.series   = data.series;
            $('#neocpan_uploaders_stats').highcharts(chart_data);
        },
        complete: function() {
            $('#cu-spinner').hide();
        }
    });
});

$("#ad").click(function() {
    $('#cd-spinner').show();
    $.ajax({
        url: "/adopted-distributions",
        dataType: "JSON",
        success: function(data) {
            $('#ad_stats').highcharts(data);
        },
        complete: function() {
            $('#cd-spinner').hide();
        }
    });
});

$("#pd-1-20").click(function() {
    $('#cd-spinner').show();
    $.ajax({
        url: "/personal-distributions/1/20",
        dataType: "JSON",
        success: function(data) {
            $('#pd_1_20_stats').highcharts(data);
        },
        complete: function() {
            $('#cd-spinner').hide();
        }
    });
});

$("#pd-21-40").click(function() {
    $('#cd-spinner').show();
    $.ajax({
        url: "/personal-distributions/21/40",
        dataType: "JSON",
        success: function(data) {
            $('#pd_21_40_stats').highcharts(data);
        },
        complete: function() {
            $('#cd-spinner').hide();
        }
    });
});

$("#pd-41-60").click(function() {
    $('#cd-spinner').show();
    $.ajax({
        url: "/personal-distributions/41/60",
        dataType: "JSON",
        success: function(data) {
            $('#pd_41_60_stats').highcharts(data);
        },
        complete: function() {
            $('#cd-spinner').hide();
        }
    });
});

$("#pd-61-80").click(function() {
    $('#cd-spinner').show();
    $.ajax({
        url: "/personal-distributions/61/80",
        dataType: "JSON",
        success: function(data) {
            $('#pd_61_80_stats').highcharts(data);
        },
        complete: function() {
            $('#cd-spinner').hide();
        }
    });
});

$("#pr_2017").click(function() {
    $('#pr-spinner').show();
    $.ajax({
        url: "/pullrequest/2017",
        dataType: "JSON",
        success: function(data) {
            $('#pr_2017_stats').highcharts(data);
        },
        complete: function() {
            $('#pr-spinner').hide();
        }
    });
});

$("#pr_2016").click(function() {
    $('#pr-spinner').show();
    $.ajax({
        url: "/pullrequest/2016",
        dataType: "JSON",
        success: function(data) {
            $('#pr_2016_stats').highcharts(data);
        },
        complete: function() {
            $('#pr-spinner').hide();
        }
    });
});

$("#pr_2015").click(function() {
    $('#pr-spinner').show();
    $.ajax({
        url: "/pullrequest/2015",
        dataType: "JSON",
        success: function(data) {
            $('#pr_2015_stats').highcharts(data);
        },
        complete: function() {
            $('#pr-spinner').hide();
        }
    });
});

$("#prc_2017").click(function() {
    $('#prc-spinner').show();
    $.ajax({
        url: "/pullrequest-challenge/2017",
        dataType: "JSON",
        success: function(data) {
            $('#prc_2017_stats').highcharts(data);
        },
        complete: function() {
            $('#prc-spinner').hide();
        }
    });
});

$("#prc_2016").click(function() {
    $('#prc-spinner').show();
    $.ajax({
        url: "/pullrequest-challenge/2016",
        dataType: "JSON",
        success: function(data) {
            $('#prc_2016_stats').highcharts(data);
        },
        complete: function() {
            $('#prc-spinner').hide();
        }
    });
});

$("#prc_2015").click(function() {
    $('#prc-spinner').show();
    $.ajax({
        url: "/pullrequest-challenge/2015",
        dataType: "JSON",
        success: function(data) {
            $('#prc_2015_stats').highcharts(data);
        },
        complete: function() {
            $('#prc-spinner').hide();
        }
    });
});

$("#gc_2017").click(function() {
    $('#gc-spinner').show();
    $.ajax({
        url: "/git-commits/2017",
        dataType: "JSON",
        success: function(data) {
            $('#gc_2017_stats').highcharts(data);
        },
        complete: function() {
            $('#gc-spinner').hide();
        }
    });
});

$("#gc_2016").click(function() {
    $('#gc-spinner').show();
    $.ajax({
        url: "/git-commits/2016",
        dataType: "JSON",
        success: function(data) {
            $('#gc_2016_stats').highcharts(data);
        },
        complete: function() {
            $('#gc-spinner').hide();
        }
    });
});

$("#gc_2015").click(function() {
    $('#gc-spinner').show();
    $.ajax({
        url: "/git-commits/2015",
        dataType: "JSON",
        success: function(data) {
            $('#gc_2015_stats').highcharts(data);
        },
        complete: function() {
            $('#gc-spinner').hide();
        }
    });
});

$("#gc_2014").click(function() {
    $('#gc-spinner').show();
    $.ajax({
        url: "/git-commits/2014",
        dataType: "JSON",
        success: function(data) {
            $('#gc_2014_stats').highcharts(data);
        },
        complete: function() {
            $('#gc-spinner').hide();
        }
    });
});

$('ul.nav li.dropdown').hover(function() {
    $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeIn(500);
}, function() {
    $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeOut(500);
});
