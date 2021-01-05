$(function() {
    $("#pullrequest_24").click();
    $("#ds").click();
    $("#pr_tracker_summary").click();
    $("#pr_summary").click();
    $("#pwc_leaders").click();
    $("#prc_summary").click();
    $("#prclub_summary").click();
    $("#hd_10").click();
    $("#gc_summary").click();
    $("#cus").click();
    $("#ad").click();
    $("#hacktoberfest").click();
    $('#txt_captcha').html(get_captcha());
    $("#map_name").val($("#map_name option:first").val());
    $("#git_topic").val($("#git_topic option:first").val());
    $("#psql_topic").val($("#psql_topic option:first").val());
});

var historical_chart = {
    "title"    : { "text" : null },
    "subtitle" : { "text" : null },
    "series"   : null,
    "tooltip"  : { "pointFormat" : "Age: <b>{point.y:.0f} days</b>" },
    "legend"   : { "enabled" : "false" },
    "chart"    : { "type" : "column" },
    "yAxis"    : { "title" : { "text" : "Age (days)" }, "min" : 0 },
    "xAxis"    : {
        "labels" : { "rotation" : -45, "style" : { "fontFamily" : "Verdana, sans-serif", "fontSize" : "13px" } },
        "type"   : "category"
    }
};

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

$('#git_topic').change(function() {
    var topic_id = $("#git_topic option:selected").val();
    if (!topic_id) {
        $("#git_how_to_response").html('');
        return;
    }

    $("#git_how_to_response").html('');
    $('#how-to-spinner').show();
    $.ajax({
        url: "/git-how-to/" + topic_id,
        dataType: "HTML",
        success: function(data) {
            $("#git_how_to_response").html(data);
        },
        complete: function() {
            $('#how-to-spinner').hide();
        }
    });
});

$('#psql_topic').change(function() {
    var topic_id = $("#psql_topic option:selected").val();
    if (!topic_id) {
        $("#psql_how_to_response").html('');
        return;
    }

    $("#psql_how_to_response").html('');
    $('#how-to-spinner').show();
    $.ajax({
        url: "/psql-how-to/" + topic_id,
        dataType: "HTML",
        success: function(data) {
            $("#psql_how_to_response").html(data);
        },
        complete: function() {
            $('#how-to-spinner').hide();
        }
    });
});

function get_captcha() {

    var alpha = new Array('A','B','C','D','E','F','G','H','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','m','n','o','p','q','r','s','t','u','v','w','x','y','z');
    var a = alpha[Math.floor(Math.random() * alpha.length)];
    var b = alpha[Math.floor(Math.random() * alpha.length)];
    var c = alpha[Math.floor(Math.random() * alpha.length)];
    var d = alpha[Math.floor(Math.random() * alpha.length)];
    var e = alpha[Math.floor(Math.random() * alpha.length)];
    var captcha = a + ' ' + b + ' ' + ' ' + c + ' ' + d + ' ' + e;

    return captcha;
}

$('#map_name').change(function() {
    var map = $("#map_name option:selected").val();
    if (!map) {
        $("#shortest-route-result").html('');
        $("#start").html('');
        $("#end").html('');
        $('#txt_captcha_response').val('');
        return;
    }

    $("#start").html('');
    $("#end").html('');
    $("#shortest-route-result").html('');
    $('#map-tube-spinner').show();
    $('#txt_captcha').html(get_captcha());
    $('#txt_captcha_response').val('');
    $.ajax({
        url: "/stations/" + map,
        dataType: "HTML",
        success: function(data) {
            $("#start").html(data);
            $("#end").html(data);
        },
        complete: function() {
            $('#map-tube-spinner').hide();
        }
    });
});

$('#map_tube_button').click(function() {
    var map = $("#map_name option:selected").val();
    if (!map) {
        return BootstrapDialog.show({
            title: 'ERROR',
            message: 'Please select the map.',
            buttons: [{
                label: 'Close',
                action: function(dialogItself){ dialogItself.close(); }
            }]
        });
    }

    var start_station = $("#start option:selected").val();
    if (!start_station) {
        return BootstrapDialog.show({
            title: 'ERROR',
            message: 'Please select the start station.',
            buttons: [{
                label: 'Close',
                action: function(dialogItself){ dialogItself.close(); }
            }]
        });
    }

    var end_station = $("#end option:selected").val();
    if (!end_station) {
        return BootstrapDialog.show({
            title: 'ERROR',
            message: 'Please select the end station.',
            buttons: [{
                label: 'Close',
                action: function(dialogItself){ dialogItself.close(); }
            }]
        });
    }

    var txt_captcha = $('#txt_captcha').text();
    var txt_captcha_response = $('#txt_captcha_response').val();
    if (!(txt_captcha.replace(/\s+/g, "") == txt_captcha_response.replace(/\s+/g, ""))) {
        return BootstrapDialog.show({
            title: 'ERROR',
            message: 'Captcha mismatched,',
            buttons: [{
                label: 'Close',
                action: function(dialogItself){ dialogItself.close(); }
            }]
        });
    }

    $('#map-tube-spinner').show();
    $.ajax({
        url: "/shortest-route/" + encodeURIComponent(map) + "/" + encodeURIComponent(start_station) + "/" + encodeURIComponent(end_station),
        dataType: "HTML",
        success: function(data) {
            $("#shortest-route-result").html(data);
        },
        error: function() {
            $("#shortest-route-result").html("<p class='bg-danger'><strong>ERROR: You have reached request limit. Please try again in a minute.</strong></p>");
        },
        complete: function() {
            $('#map-tube-spinner').hide();
        }
    });
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

$("#pd-a-c").click(function() {
    $('#cd-spinner').show();
    $.ajax({
        url: "/personal-distributions/a/c",
        dataType: "JSON",
        success: function(data) {
            $('#pd_a_c_stats').highcharts(data);
        },
        complete: function() {
            $('#cd-spinner').hide();
        }
    });
});

$("#pd-d-h").click(function() {
    $('#cd-spinner').show();
    $.ajax({
        url: "/personal-distributions/d/h",
        dataType: "JSON",
        success: function(data) {
            $('#pd_d_h_stats').highcharts(data);
        },
        complete: function() {
            $('#cd-spinner').hide();
        }
    });
});

$("#pd-i-p").click(function() {
    $('#cd-spinner').show();
    $.ajax({
        url: "/personal-distributions/i/p",
        dataType: "JSON",
        success: function(data) {
            $('#pd_i_p_stats').highcharts(data);
        },
        complete: function() {
            $('#cd-spinner').hide();
        }
    });
});

$("#pd-q-z").click(function() {
    $('#cd-spinner').show();
    $.ajax({
        url: "/personal-distributions/q/z",
        dataType: "JSON",
        success: function(data) {
            $('#pd_q_z_stats').highcharts(data);
        },
        complete: function() {
            $('#cd-spinner').hide();
        }
    });
});

$("#hd_10").click(function() {
    $('#hd-spinner').show();
    $.ajax({
        url: "/historical-distributions/10",
        dataType: "JSON",
        success: function(data) {
            var top_10_data = historical_chart;
            top_10_data.title.text    = "Historical Distributions - Top 10";
            top_10_data.subtitle.text = data.subtitle;
            top_10_data.series = data.series;
            $('#hd_10_stats').highcharts(top_10_data);
        },
        complete: function() {
            $('#hd-spinner').hide();
        }
    });
});

$("#hd_20").click(function() {
    $('#hd-spinner').show();
    $.ajax({
        url: "/historical-distributions/20",
        dataType: "JSON",
        success: function(data) {
            var top_20_data = historical_chart;
            top_20_data.title.text    = "Historical Distributions - Top 20";
            top_20_data.subtitle.text = data.subtitle;
            top_20_data.series = data.series;
            $('#hd_20_stats').highcharts(top_20_data);
        },
        complete: function() {
            $('#hd-spinner').hide();
        }
    });
});

$("#hd_30").click(function() {
    $('#hd-spinner').show();
    $.ajax({
        url: "/historical-distributions/30",
        dataType: "JSON",
        success: function(data) {
            var top_30_data = historical_chart;
            top_30_data.title.text    = "Historical Distributions - Top 30";
            top_30_data.subtitle.text = data.subtitle;
            top_30_data.series = data.series;
            $('#hd_30_stats').highcharts(top_30_data);
        },
        complete: function() {
            $('#hd-spinner').hide();
        }
    });
});

$("#pr_tracker_summary").click(function() {
    $('#cd-spinner').show();
    $.ajax({
        url: "/pull-request-tracker",
        dataType: "JSON",
        success: function(data) {
            $('#pr_tracker_summary_stats').highcharts(data);
        },
        complete: function() {
            $('#cd-spinner').hide();
        }
    });
});

$("#author_by_pr").click(function() {
    $('#cd-spinner').show();
    $.ajax({
        url: "/author-by-pr",
        dataType: "JSON",
        success: function(data) {
            $('#author_by_pr_stats').highcharts(data);
        },
        complete: function() {
            $('#cd-spinner').hide();
        }
    });
});

$("#author_by_repo").click(function() {
    $('#cd-spinner').show();
    $.ajax({
        url: "/author-by-repo",
        dataType: "JSON",
        success: function(data) {
            $('#author_by_repo_stats').highcharts(data);
        },
        complete: function() {
            $('#cd-spinner').hide();
        }
    });
});

$("#pr_summary").click(function() {
    $('#pr-spinner').show();
    $.ajax({
        url: "/pullrequest/summary",
        dataType: "JSON",
        success: function(data) {
            $('#pr_summary_stats').highcharts(data);
        },
        complete: function() {
            $('#pr-spinner').hide();
        }
    });
});

$("#pr_2021").click(function() {
    $('#pr-spinner').show();
    $.ajax({
        url: "/pullrequest/2021",
        dataType: "JSON",
        success: function(data) {
            $('#pr_2021_stats').highcharts(data);
        },
        complete: function() {
            $('#pr-spinner').hide();
        }
    });
});

$("#pr_2020").click(function() {
    $('#pr-spinner').show();
    $.ajax({
        url: "/pullrequest/2020",
        dataType: "JSON",
        success: function(data) {
            $('#pr_2020_stats').highcharts(data);
        },
        complete: function() {
            $('#pr-spinner').hide();
        }
    });
});

$("#pr_2019").click(function() {
    $('#pr-spinner').show();
    $.ajax({
        url: "/pullrequest/2019",
        dataType: "JSON",
        success: function(data) {
            $('#pr_2019_stats').highcharts(data);
        },
        complete: function() {
            $('#pr-spinner').hide();
        }
    });
});

$("#pr_2018").click(function() {
    $('#pr-spinner').show();
    $.ajax({
        url: "/pullrequest/2018",
        dataType: "JSON",
        success: function(data) {
            $('#pr_2018_stats').highcharts(data);
        },
        complete: function() {
            $('#pr-spinner').hide();
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

$("#pwc_leaders").click(function() {
    $('#pwc-spinner').show();
    $.ajax({
        url: "/pwc-leaders",
        dataType: "JSON",
        success: function(data) {
            $('#pwc_leaders_stats').highcharts(data);
        },
        complete: function() {
            $('#pwc-spinner').hide();
        }
    });
});

$("#prclub_summary").click(function() {
    $('#prclub-spinner').show();
    $.ajax({
        url: "/pullrequest-club/summary",
        dataType: "JSON",
        success: function(data) {
            $('#prclub_summary_stats').highcharts(data);
        },
        complete: function() {
            $('#prclub-spinner').hide();
        }
    });
});

$("#prclub_2020").click(function() {
    $('#prclub-spinner').show();
    $.ajax({
        url: "/pullrequest-club/2020",
        dataType: "JSON",
        success: function(data) {
            $('#prclub_2020_stats').highcharts(data);
        },
        complete: function() {
            $('#prclub-spinner').hide();
        }
    });
});

$("#prclub_2019").click(function() {
    $('#prclub-spinner').show();
    $.ajax({
        url: "/pullrequest-club/2019",
        dataType: "JSON",
        success: function(data) {
            $('#prclub_2019_stats').highcharts(data);
        },
        complete: function() {
            $('#prclub-spinner').hide();
        }
    });
});

$("#prc_summary").click(function() {
    $('#prc-spinner').show();
    $.ajax({
        url: "/pullrequest-challenge/summary",
        dataType: "JSON",
        success: function(data) {
            $('#prc_summary_stats').highcharts(data);
        },
        complete: function() {
            $('#prc-spinner').hide();
        }
    });
});

$("#prc_2018").click(function() {
    $('#prc-spinner').show();
    $.ajax({
        url: "/pullrequest-challenge/2018",
        dataType: "JSON",
        success: function(data) {
            $('#prc_2018_stats').highcharts(data);
        },
        complete: function() {
            $('#prc-spinner').hide();
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

$("#gc_summary").click(function() {
    $('#gc-spinner').show();
    $.ajax({
        url: "/git-commits/summary",
        dataType: "JSON",
        success: function(data) {
            $('#gc_summary_stats').highcharts(data);
        },
        complete: function() {
            $('#gc-spinner').hide();
        }
    });
});

$("#gc_2021").click(function() {
    $('#gc-spinner').show();
    $.ajax({
        url: "/git-commits/2021",
        dataType: "JSON",
        success: function(data) {
            $('#gc_2021_stats').highcharts(data);
        },
        complete: function() {
            $('#gc-spinner').hide();
        }
    });
});

$("#gc_2020").click(function() {
    $('#gc-spinner').show();
    $.ajax({
        url: "/git-commits/2020",
        dataType: "JSON",
        success: function(data) {
            $('#gc_2020_stats').highcharts(data);
        },
        complete: function() {
            $('#gc-spinner').hide();
        }
    });
});

$("#gc_2019").click(function() {
    $('#gc-spinner').show();
    $.ajax({
        url: "/git-commits/2019",
        dataType: "JSON",
        success: function(data) {
            $('#gc_2019_stats').highcharts(data);
        },
        complete: function() {
            $('#gc-spinner').hide();
        }
    });
});

$("#gc_2018").click(function() {
    $('#gc-spinner').show();
    $.ajax({
        url: "/git-commits/2018",
        dataType: "JSON",
        success: function(data) {
            $('#gc_2018_stats').highcharts(data);
        },
        complete: function() {
            $('#gc-spinner').hide();
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

$("#hacktoberfest").click(function() {
    $('#pr-events-spinner').show();
    $.ajax({
        url: "/hacktoberfest",
        dataType: "JSON",
        success: function(data) {
            $('#hacktoberfest_stats').highcharts(data);
        },
        complete: function() {
            $('#pr-events-spinner').hide();
        }
    });
});

$("#pullrequest_24").click(function() {
    $('#pr-events-spinner').show();
    $.ajax({
        url: "/24pullrequest",
        dataType: "JSON",
        success: function(data) {
            $('#pullrequest_24_stats').highcharts(data);
        },
        complete: function() {
            $('#pr-events-spinner').hide();
        }
    });
});

$('ul.nav li.dropdown').hover(function() {
    $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeIn(500);
}, function() {
    $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeOut(500);
});
