package manwar;

use strict; use warnings;
use Data::Dumper;
use JSON;
use HTML::Entities;
use MIME::Lite;
use Cache::Memcached::Fast;
use Map::Tube::API;
use Dancer2;
use Dancer2::FileUtils qw(path read_file_content);

=head1 NAME

Dancer2 App - manwar.org

=head1 VERSION

Version 0.31

=head1 AUTHOR

Mohammad S Anwar, C<< <mohammad.anwar at yahoo.com> >>

=cut

$manwar::VERSION   = '0.31';
$manwar::AUTHORITY = 'cpan:MANWAR';

sub get_template_data {

    my $cpan_recent      = get_source_data('cpan-recent.json');
    my $what_is_new      = get_source_data('what-is-new.json');
    my $favourite_topics = get_source_data('favourite-topics.json');
    my $work             = get_source_data('work.json');

    return {
        cr             => $cpan_recent->{rows},
        cr_title       => $cpan_recent->{title},
        cr_sub_title   => $cpan_recent->{sub_title},
        maps           => get_maps(),
        #dists          => get_dists(),
        git_topics     => get_source_data('git-how-to.json'),
        psql_topics    => get_source_data('psql-how-to.json'),
        who_am_i       => get_source_data('who-am-i.json'),
        work           => $work->{work},
        current        => $work->{current},
        win            => $what_is_new,
        win_indicators => get_indicators($what_is_new),
        ft             => $favourite_topics,
        ft_indicators  => get_indicators($favourite_topics),
    };
}

get '/' => sub {

    template 'index' => get_template_data();
};

get '/git-how-to/:topic' => sub {

    my $topic = route_parameters->{topic};
    return _get_answer(get_source_data('git-how-to.json'), $topic);
};

get '/psql-how-to/:topic' => sub {

    my $topic = route_parameters->{topic};
    return _get_answer(get_source_data('psql-how-to.json'), $topic);
};

get '/stations/:map' => sub {

    my $map = route_parameters->{map};
    my $get_name = sub {
        my ($station) = @_;
        $station =~ m/(.*?\()/;
        $station = $1;
        $station =~ s|(.*)\s+\(|$1|;
        return $station;
    };

    my $stations = Map::Tube::API->new->map_stations({ map => $map });
    my $data = "<option value=''>--Select station--</option>\n";
    foreach my $station (@$stations) {
        $data .= sprintf("<option value='%s'>%s</option>\n", encode_entities($get_name->($station)), $station);
    }

    content_type 'text/html';
    return $data;
};

get '/shortest-route/:map/:start/:end' => sub {

    my $map   = route_parameters->{map};
    my $start = route_parameters->{start};
    my $end   = route_parameters->{end};

    my $stations = Map::Tube::API->new->shortest_route({ map => $map, start => $start, end => $end });
    my $data = '';
    if (scalar(@$stations)) {
        $data = "<ol>\n";
        foreach my $station (@$stations) {
            $data .= sprintf("<li>%s</li>\n", $station);
        }
        $data .= "</ol>\n";
    }

    content_type 'text/html';
    return $data;
};

get '/stats/:type' => sub {

    my $type = route_parameters->{type};
    my $file = sprintf("%s.json", $type);

    return send_data(path(setting('appdir'), 'public', 'stats', $file));
};

get '/pullrequest/:tag' => sub {

    my $tag = route_parameters->{tag};
    my $file;
    if ($tag =~ /^\d+$/) {
        $file = sprintf("pr-%d.json", $tag);
    }
    else {
        $file = sprintf("pr-%s.json", $tag);
    }

    return send_data(path(setting('appdir'), 'public', 'stats', $file));
};

get '/historical-distributions/:tag' => sub {

    my $tag    = route_parameters->{tag};
    my $data   = read_file_content(path(setting('appdir'), 'public', 'stats', 'historical-distributions.json'));
    my $source = JSON->new->allow_nonref->utf8(1)->decode($data);
    my $series = $source->{series}->[0]->{data};
    my $index  = 0;
    my $chart  = [];
    foreach my $row (@$series) {
        push @$chart, $row;
        $index++;
        last if ($index == $tag);
    }
    $source->{series}->[0]->{data} = $chart;

    return send_raw_data(JSON->new->allow_nonref->utf8(1)->encode($source));
};

get '/pwc-leaders' => sub {

    return send_data(path(setting('appdir'), 'public', 'stats', "pwc-leaders.json"));
};

get '/pullrequest-club/:tag' => sub {

    my $tag = route_parameters->{tag};
    my $file;
    if ($tag =~ /^\d+$/) {
        $file = sprintf("prclub-%d.json", $tag);
    }
    else {
        $file = sprintf("prclub-%s.json", $tag);
    }

    return send_data(path(setting('appdir'), 'public', 'stats', $file));
};

get '/pullrequest-challenge/:tag' => sub {

    my $tag = route_parameters->{tag};
    my $file;
    if ($tag =~ /^\d+$/) {
        $file = sprintf("prc-%d.json", $tag);
    }
    else {
        $file = sprintf("prc-%s.json", $tag);
    }

    return send_data(path(setting('appdir'), 'public', 'stats', $file));
};

get '/git-commits/:tag' => sub {

    my $tag = route_parameters->{tag};
    my $file;
    if ($tag =~ /^\d+$/) {
        $file = sprintf("gc-%d.json", $tag);
    }
    else {
        $file = sprintf("gc-%s.json", $tag);
    }

    return send_data(path(setting('appdir'), 'public', 'stats', $file));
};

get '/hacktoberfest' => sub {

    return send_data(path(setting('appdir'), 'public', 'stats', 'hacktoberfest.json'));
};

get '/24pullrequest' => sub {

    return send_data(path(setting('appdir'), 'public', 'stats', '24-pullrequest.json'));
};

get '/cpan-uploaders/:limit' => sub {

    my $limit = route_parameters->{limit};
    return send_data(path(setting('appdir'), 'public', 'stats', 'cpan-uploaders.json'));
};

get '/neocpan-uploaders/:limit' => sub {

    my $limit = route_parameters->{limit};
    return send_data(path(setting('appdir'), 'public', 'stats', 'neocpan-uploaders.json'));
};

get '/adopted-distributions' => sub {

    return send_data(path(setting('appdir'), 'public', 'stats', 'adopted-distributions.json'));
};

get '/pull-request-tracker' => sub {

    return send_data(path(setting('appdir'), 'public', 'stats', 'pull-request-tracker.json'));
};

get '/author-by-pr' => sub {

    return send_data(path(setting('appdir'), 'public', 'stats', 'author-by-pr.json'));
};

get '/author-by-repo' => sub {

    return send_data(path(setting('appdir'), 'public', 'stats', 'author-by-repo.json'));
};

get '/personal-distributions/:start/:end' => sub {

    my $start = route_parameters->{start};
    my $end   = route_parameters->{end};
    my $file  = sprintf("pd_%s_to_%s.json", $start, $end);
    return send_data(path(setting('appdir'), 'public', 'stats', $file));
};

post '/contact' => sub {
    my $name    = body_parameters->{'uname'};
    my $email   = body_parameters->{'uemail'};
    my $subject = body_parameters->{'usubject'};
    my $message = body_parameters->{'umessage'};

    my $status;
    eval {
        my $mailer = MIME::Lite->new(
            From    => 'anwar.sajid@gmail.com',
            To      => 'anwar.sajid@gmail.com',
            Subject => "From: $name <$email>",
            Data    => $message
        );

        $mailer->send;
        $status = 'Thank you for contacting us. We will get back to you in the next 24 hours.';
    };
    if ($@) {
        $status = 'Unable to submit the request, please try again.';
    }

    return $status;
};

=head1
get '/my-reading-links' => sub {
    template 'my-reading-links';
};
=cut

#
#
# LOCAL METHODS

sub _get_answer {
    my ($topics, $topic_id) = @_;

    foreach my $topic (@$topics) {
        if ($topic->{id} == $topic_id) {
            content_type 'text/html';
            return $topic->{answer};
        }
    }
}

sub send_data {
    my ($path) = @_;

    content_type 'application/json';
    return read_file_content($path);
}

sub send_raw_data {
    my ($data) = @_;

    content_type 'application/json';
    return $data;
}

sub get_maps {

    # TODO
    # ERROR:
    # [Map::Tube::Server:21982] error @2019-04-09 11:03:08> Route exception: Can't upgrade BIND (1) to 4 at /usr/local/share/perl/5.14.2/Class/Load.pm line 147.

    #my $available_maps = Map::Tube::API->new->available_maps;
    my $maps = [];
    #foreach my $map (@$available_maps) {
    #    push @{$maps}, { name => $map };
    #}

    return $maps;
}

sub get_dists {

    my $total_dists = get_total_dists();
    my $dists = [];
    my $row   = [];
    my $col   = 0;
    foreach my $dist (@$total_dists) {
        if ($col == 6) {
            push @$dists, $row;
            $row = [];
            $col = 0;
        }
        push @$row, $dist;
        $col++;
    }
    push @$dists, $row;

    return $dists;
}

sub get_source_data {
    my ($file_name) = @_;

    my $file = read_file_content(path(setting('appdir'), 'public', 'stats', $file_name));
    return JSON->new->allow_nonref->utf8(1)->decode($file);
}

sub get_indicators {
    my ($data) = @_;

    my $indicators = [];
    my $index = 0;
    foreach (@$data) {
        if ($index == 0) {
            push @$indicators, { slide_to => $index, class => "class=\"active\"" };
        }
        else {
            push @$indicators, { slide_to => $index };
        }
        $index++;
    }

    return $indicators;
}

sub get_total_dists {
    return [
        { name => "Map::Tube::Athens",          title => "Athens"           },
        { name => "Map::Tube::Barcelona",       title => "Barcelona"        },
        { name => "Map::Tube::Beijing",         title => "Beijing"          },
        { name => "Map::Tube::Berlin",          title => "Berlin"           },
        { name => "Map::Tube::Bucharest",       title => "Bucharest"        },
        { name => "Map::Tube::Budapest",        title => "Budapest"         },
        { name => "Map::Tube::Copenhagen",      title => "Copenhagen"       },
        { name => "Map::Tube::Delhi",           title => "Delhi"            },
        { name => "Map::Tube::Dnipropetrovsk",  title => "Dnipropetrovsk"   },
        { name => "Map::Tube::Glasgow",         title => "Glasgow"          },
        { name => "Map::Tube::Kazan",           title => "Kazan"            },
        { name => "Map::Tube::Kharkiv",         title => "Kharkiv"          },
        { name => "Map::Tube::Kiev",            title => "Kiev"             },
        { name => "Map::Tube::KoelnBonn",       title => "Koeln Bonn"       },
        { name => "Map::Tube::Kolkatta",        title => "Kolkatta"         },
        { name => "Map::Tube::KualaLumpur",     title => "Kuala Lumpur"     },
        { name => "Map::Tube::London",          title => "London"           },
        { name => "Map::Tube::Lyon",            title => "Lyon"             },
        { name => "Map::Tube::Malaga",          title => "Malaga"           },
        { name => "Map::Tube::Milan",           title => "Milan"            },
        { name => "Map::Tube::Minsk",           title => "Minsk"            },
        { name => "Map::Tube::Moscow",          title => "Moscow"           },
        { name => "Map::Tube::NYC",             title => "New York"         },
        { name => "Map::Tube::Nanjing",         title => "Nanjing"          },
        { name => "Map::Tube::NizhnyNovgorod",  title => "Nizhny Novgorod"  },
        { name => "Map::Tube::Novosibirsk",     title => "Novosibirsk"      },
        { name => "Map::Tube::Prague",          title => "Prague"           },
        { name => "Map::Tube::SaintPetersburg", title => "Saint Petersburg" },
        { name => "Map::Tube::Samara",          title => "Samara"           },
        { name => "Map::Tube::Singapore",       title => "Singapore"        },
        { name => "Map::Tube::Sofia",           title => "Sofia"            },
        { name => "Map::Tube::Tbilisi",         title => "Tbilisi"          },
        { name => "Map::Tube::Tokyo",           title => "Tokyo"            },
        { name => "Map::Tube::Vienna",          title => "Vienna"           },
        { name => "Map::Tube::Warsaw",          title => "Warsaw"           },
        { name => "Map::Tube::Yekaterinburg",   title => "Yekaterinburg"    }
    ];
}

1;
