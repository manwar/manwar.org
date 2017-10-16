package Map::Tube::API;

use strict; use warnings;
use Data::Dumper;

use Dancer2;
use Dancer2::Plugin::Res;
use Dancer2::Plugin::Map::Tube;

=head1 NAME

Map::Tube::API - REST API for Map::Tube.

=head1 VERSION

Version 0.01

=cut

$Map::Tube::API::VERSION   = '0.01';
$Map::Tube::API::AUTHORITY = 'cpan:MANWAR';

hook before => sub {
    header 'Content-Type' => 'application/json';
};

=head1 DESCRIPTION

=head1 ROUTES

=head2 POST /map-tube/v1/shortest-route

Request must have the following data:

    +-------+-------------------------------------------+
    | Key   | Description                               |
    +-------+-------------------------------------------+
    | name  | Map name e.g. London,Delhi,Barcelona etc. |
    | start | Start station name.                       |
    | end   | End station name.                         |
    +-------+-------------------------------------------+

Returns ref to an array of shortest route stations list in JSON format.

=cut

post '/shortest-route' => sub {
    my $client   = request->address;
    my $name     = body_parameters->get('map');
    my $start    = body_parameters->get('start');
    my $end      = body_parameters->get('end');
    my $response = api($name)->shortest_route($client, $start, $end);

    return res($response->{error_code} => $response->{error_message})
        if (exists $response->{error_code});

    return $response->{content};
};

=head2 GET /map-tube/v1/stations/:map/:line

=cut

get '/stations/:map/:line' => sub {
    my $client   = request->address;
    my $name     = route_parameters->get('map');
    my $line     = route_parameters->get('line');
    my $response = api($name)->line_stations($client, $line);

    return res($response->{error_code} => $response->{error_message})
        if (exists $response->{error_code});

    return $response->{content};
};

=head2 GET /map-tube/v1/stations/:map

=cut

get '/stations/:map' => sub {
    my $client   = request->address;
    my $name     = route_parameters->get('map');
    my $response = api($name)->map_stations($client);

    return res($response->{error_code} => $response->{error_message})
        if (exists $response->{error_code});

    return $response->{content};
};

=head2 GET /map-tube/v1/maps

=cut

get '/maps' => sub {
    my $client   = request->address;
    my $response = api->supported_maps($client);

    return res($response->{error_code} => $response->{error_message})
        if (exists $response->{error_code});

    return $response->{content};
};

=head1 AUTHOR

Mohammad S Anwar, C<< <mohammad.anwar at yahoo.com> >>

=cut

1;
