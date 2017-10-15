package Map::Tube::API;

use strict; use warnings;
use Data::Dumper;
use JSON;
use Dancer2;
use Dancer2::Plugin::Res;
use Cache::Memcached::Fast;

=head1 NAME

Map::Tube::API - REST API for Map::Tube.

=head1 VERSION

Version 0.01

=head1 AUTHOR

Mohammad S Anwar, C<< <mohammad.anwar at yahoo.com> >>

=cut

$manwar::VERSION   = '0.01';
$manwar::AUTHORITY = 'cpan:MANWAR';

use Map::Tube::NYC;
use Map::Tube::Delhi;
use Map::Tube::London;
use Map::Tube::Kolkatta;
use Map::Tube::Barcelona;

our $SUPPORTED_MAPS;
our $MEMD;
our $REQUEST_PERIOD    = 60; # seconds
our $REQUEST_THRESHOLD = 30; # 30 request per minute

BEGIN {
    $SUPPORTED_MAPS = {
        'London'    => Map::Tube::London->new,
        'Delhi'     => Map::Tube::Delhi->new,
        'Kolkatta'  => Map::Tube::Kolkatta->new,
        'Barcelona' => Map::Tube::Barcelona->new,
        #'New York'  => Map::Tube::NYC->new,
    };

    $MEMD = new Cache::Memcached::Fast({ servers => [ { address => 'localhost:11211' } ] });
};

hook before => sub {
    header 'Content-Type' => 'application/json';
};

post '/shortest-route' => sub {

    my $client = request->address;
    return res(401 => "You have reached the threshold. Please try later.")
        unless (is_authorized($client));

    my $map   = body_parameters->get('map');
    my $start = body_parameters->get('start');
    my $end   = body_parameters->get('end');

    my $object = _get_map_object($map);
    return res(400 => "[$map] not supported yet.") unless defined $object;

    my $route = $object->get_shortest_route($start, $end);
    return to_json([ map { sprintf("%s", $_) } @{$route->nodes} ]);
};

get '/stations/:map/:line' => sub {

    my $client = request->address;
    return res(401 => "You have reached the threshold. Please try later.")
        unless (is_authorized($client));

    my $map  = route_parameters->get('map');
    my $line = route_parameters->get('line');

    my $object = _get_map_object($map);
    return res(400 => "[$map] not supported yet.") unless defined $object;

    my $stations = $object->get_stations($object->get_line_by_id($line)->name);
    return to_json([ map { sprintf("%s", $_) } @{$stations} ]);
};

get '/stations/:map' => sub {

    my $client = request->address;
    return res(401 => "You have reached the threshold. Please try later.")
        unless (is_authorized($client));

    my $map = route_parameters->get('map');

    my $object = _get_map_object($map);
    return res(400 => "[$map] not supported yet.") unless defined $object;

    my $lines    = $object->get_lines;
    my $stations = {};
    foreach my $line (@$lines) {
        foreach my $station (@{$object->get_stations($line->name)}) {
            $stations->{sprintf("%s", $station)} = 1;
        }
    }

    return to_json([ sort keys %$stations ]);
};

get '/maps' => sub {

    my $client = request->address;
    return res(401 => "You have reached the threshold. Please try later.")
        unless (is_authorized($client));

    return to_json([ join(", ", sort keys %$SUPPORTED_MAPS) ]);
};

#
#
# PRIVATE METHODS

sub is_authorized {
    my ($client_ip) = @_;

    my $userdata = $MEMD->get('userdata');
    my $now = time;

    if (defined $userdata) {
        if (exists $userdata->{$client_ip}) {
            my $old = $userdata->{$client_ip}->{last_access_time};
            my $cnt = $userdata->{$client_ip}->{count};
            if (($now - $old) < $REQUEST_PERIOD) {
                if (($cnt + 1) > $REQUEST_THRESHOLD) {
                    return 0;
                }
                else {
                    $userdata->{$client_ip}->{last_access_time} = $now;
                    $userdata->{$client_ip}->{count} = $cnt + 1;
                }
            }
            else {
                $userdata->{$client_ip}->{last_access_time} = $now;
                $userdata->{$client_ip}->{count} = 1;
            }
        }
        else {
            $userdata->{$client_ip}->{last_access_time} = $now;
            $userdata->{$client_ip}->{count} = 1;
        }

        $MEMD->replace('userdata', $userdata);
    }
    else {
        $userdata->{$client_ip}->{last_access_time} = $now;
        $userdata->{$client_ip}->{count} = 1;

        $MEMD->add('userdata', $userdata);
    }

    return 1;
}

sub _get_map_object {
    my ($map) = @_;
    return unless defined $map;

    if ($map =~ /\s/) {
        my @parts = split(/\s/, $map);
        my @map   = ();
        foreach my $part (@parts) {
            push @map, ucfirst(lc($part));
        }

        $map = join(" ", @map);
    }
    else {
        $map = ucfirst(lc($map));
    }

    return $SUPPORTED_MAPS->{$map};
}

1;
