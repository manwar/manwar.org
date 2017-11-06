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

Version 0.25

=head1 AUTHOR

Mohammad S Anwar, C<< <mohammad.anwar at yahoo.com> >>

=cut

$manwar::VERSION   = '0.25';
$manwar::AUTHORITY = 'cpan:MANWAR';

our $MEMCACHE = Cache::Memcached::Fast->new({ servers => [{ address => 'localhost:11211' }] });

get '/' => sub {

    my $file = read_file_content(path(setting('appdir'), 'public', 'stats', 'cpan-recent.json'));
    my $data = JSON->new->allow_nonref->utf8(1)->decode($file);

    $data->{maps}     = get_maps();
    $data->{dists}    = get_dists();
    $data->{who_am_i} = get_who_am_i();
    $data->{work}     = get_work();
    $data->{current}  = get_current();

    template 'index' => $data;
};

get '/stations/:map' => sub {

    my $map = params->{map};
    my $get_name = sub {
        my ($station) = @_;
        $station =~ m/(.*?\()/;
        $station = $1;
        $station =~ s|(.*)\s+\(|$1|;
        return $station;
    };

    my $stations = _get_cached_stations($map);
    my $data = "<option value=''>--Select station--</option>\n";
    foreach my $station (@$stations) {
        $data .= sprintf("<option value='%s'>%s</option>\n", encode_entities($get_name->($station)), $station);
    }

    content_type 'text/html';
    return $data;
};

get '/shortest-route/:map/:start/:end' => sub {

    my $map   = params->{map};
    my $start = params->{start};
    my $end   = params->{end};

    my $stations = _get_cached_routes($map, $start, $end);
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

    my $type = params->{type};
    my $file = sprintf("%s.json", $type);

    return send_data(path(setting('appdir'), 'public', 'stats', $file));
};

get '/pullrequest/:tag' => sub {

    my $tag = params->{tag};
    my $file;
    if ($tag =~ /^\d+$/) {
        $file = sprintf("pr-%d.json", $tag);
    }
    else {
        $file = sprintf("pr-%s.json", $tag);
    }

    return send_data(path(setting('appdir'), 'public', 'stats', $file));
};

get '/pullrequest-challenge/:tag' => sub {

    my $tag = params->{tag};
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

    my $tag = params->{tag};
    my $file;
    if ($tag =~ /^\d+$/) {
        $file = sprintf("gc-%d.json", $tag);
    }
    else {
        $file = sprintf("gc-%s.json", $tag);
    }

    return send_data(path(setting('appdir'), 'public', 'stats', $file));
};

get '/cpan-uploaders/:limit' => sub {

    my $limit = params->{limit};
    return send_data(path(setting('appdir'), 'public', 'stats', 'cpan-uploaders.json'));
};

get '/neocpan-uploaders/:limit' => sub {

    my $limit = params->{limit};
    return send_data(path(setting('appdir'), 'public', 'stats', 'neocpan-uploaders.json'));
};

get '/adopted-distributions' => sub {

    return send_data(path(setting('appdir'), 'public', 'stats', 'adopted-distributions.json'));
};

get '/personal-distributions/:start/:end' => sub {

    my $start = params->{start};
    my $end   = params->{end};
    my $file  = sprintf("pd_%s_to_%s.json", $start, $end);
    return send_data(path(setting('appdir'), 'public', 'stats', $file));
};

post '/contact' => sub {
    my $name    = params->{'uname'};
    my $email   = params->{'uemail'};
    my $subject = params->{'usubject'};
    my $message = params->{'umessage'};

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

=head
get '/my-reading-links' => sub {
    template 'my-reading-links';
};
=cut

#
#
# LOCAL METHODS

sub _get_cached_maps {

    my $cached_maps = $MEMCACHE->get('maps');
    if (defined $cached_maps) {
        print STDERR "Retrieving cached maps ...\n";
        return $cached_maps;
    }

    my $map_api = Map::Tube::API->new;
    my $maps    = $map_api->available_maps;

    print STDERR "Caching maps ...\n";
    $MEMCACHE->add('maps', $maps);

    return $maps;
}

sub _get_cached_stations {
    my ($map) = @_;

    my $cached_stations = $MEMCACHE->get('stations');
    if (defined $cached_stations && (exists $cached_stations->{$map})) {
        print STDERR "Retrieving cached map [$map] stations ...\n";
        return $cached_stations->{$map};
    }

    my $map_api = Map::Tube::API->new;
    my $stations = $map_api->map_stations({ map => $map });

    print STDERR "Caching map [$map] stations ...\n";
    if (defined $cached_stations) {
        $cached_stations->{$map} = $stations;
        $MEMCACHE->replace('stations', $cached_stations);
    }
    else {
        $cached_stations->{$map} = $stations;
        $MEMCACHE->add('stations', $cached_stations);
    }

    return $stations;
}

sub _get_cached_routes {
    my ($map, $start, $end) = @_;

    my $cached_routes = $MEMCACHE->get('routes');
    if (defined $cached_routes
        && (exists $cached_routes->{$map})
        && (exists $cached_routes->{$map}->{$start})
        && (exists $cached_routes->{$map}->{$start}->{$end})
       ) {
        print STDERR "Retrieving cached routes in [$map] from [$start] to [$end] ...\n";
        return $cached_routes->{$map}->{$start}->{$end};
    }

    my $map_api = Map::Tube::API->new;
    my $stations = $map_api->shortest_route({ map => $map, start => $start, end => $end });

    print STDERR "Caching routes in [$map] from [$start] to [$end] ...\n";
    if (defined $cached_routes) {
        $cached_routes->{$map}->{$start}->{$end} = $stations;
        $MEMCACHE->replace('routes', $cached_routes);
    }
    else {
        $cached_routes->{$map}->{$start}->{$end} = $stations;
        $MEMCACHE->add('routes', $cached_routes);
    }

    return $stations;
}

sub send_data {
    my ($path) = @_;

    content_type 'application/json';
    return read_file_content($path);
}

sub get_maps {

    my $available_maps = _get_cached_maps();
    my $maps = [];
    foreach my $map (@$available_maps) {
        push @{$maps}, { name => $map };
    }

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

sub get_who_am_i {
    my $file = read_file_content(path(setting('appdir'), 'public', 'stats', 'who-am-i.json'));
    my $data = JSON->new->allow_nonref->utf8(1)->decode($file);
    return $data->{who_am_i};
}

sub get_work {
    my $file = read_file_content(path(setting('appdir'), 'public', 'stats', 'work.json'));
    my $data = JSON->new->allow_nonref->utf8(1)->decode($file);
    return $data->{work};
}

sub get_current {
    my $file = read_file_content(path(setting('appdir'), 'public', 'stats', 'work.json'));
    my $data = JSON->new->allow_nonref->utf8(1)->decode($file);
    return $data->{current};
}

sub get_total_dists {
    return [
        { name => "Map::Tube::Barcelona",       title => "Barcelona"        },
        { name => "Map::Tube::Beijing",         title => "Beijing"          },
        { name => "Map::Tube::Berlin",          title => "Berlin"           },
        { name => "Map::Tube::Bucharest",       title => "Bucharest"        },
        { name => "Map::Tube::Budapest",        title => "Budapest"         },
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
