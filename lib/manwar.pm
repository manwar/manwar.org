package manwar;

use strict; use warnings;
use Data::Dumper;
use JSON;
use MIME::Lite;
use Dancer2;
use Dancer2::FileUtils qw(path read_file_content);

=head1 NAME

Dancer2 App - manwar.org

=head1 VERSION

Version 0.20

=head1 AUTHOR

Mohammad S Anwar, C<< <mohammad.anwar at yahoo.com> >>

=cut

$manwar::VERSION   = '0.20';
$manwar::AUTHORITY = 'cpan:MANWAR';

get '/' => sub {

    my $file = read_file_content(path(setting('appdir'), 'public', 'stats', 'cpan-recent.json'));
    my $data = JSON->new->allow_nonref->utf8(1)->decode($file);

    template 'index' => $data;
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

get '/git-commits/:year' => sub {

    my $year = params->{year};
    my $file = sprintf("gc-%d.json", $year);
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

sub send_data {
    my ($path) = @_;

    content_type 'application/json';
    return read_file_content($path);
}

1;
