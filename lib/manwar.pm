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

Version 0.15

=head1 AUTHOR

Mohammad S Anwar, C<< <mohammad.anwar at yahoo.com> >>

=cut

$manwar::VERSION   = '0.15';
$manwar::AUTHORITY = 'cpan:MANWAR';

get '/contact-us' => sub {
    template 'contact-us';
};

post '/contact-us' => sub {
    my $name    = params->{'name'};
    my $email   = params->{'email'};
    my $subject = params->{'subject'};
    my $message = params->{'message'};

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

    template 'contact-us' => {
        status => $status
    };
};

get '/' => sub {
    template 'stats';
};

get '/cpan-regulars' => sub {
    template 'stats';
};

get '/stats/monthly' => sub {

    return send_data(path(setting('appdir'), 'public', 'stats', 'monthly.json'));
};

get '/stats/weekly' => sub {

    return send_data(path(setting('appdir'), 'public', 'stats', 'weekly.json'));
};

get '/stats/daily' => sub {

    return send_data(path(setting('appdir'), 'public', 'stats', 'daily.json'));
};

get '/cpan-uploaders' => sub {
    template 'cpan-uploaders';
};

get '/cpan-uploaders/20' => sub {

    return send_data(path(setting('appdir'), 'public', 'stats', 'cpan-uploaders.json'));
};

get '/neocpan-uploaders/20' => sub {

    return send_data(path(setting('appdir'), 'public', 'stats', 'neocpan-uploaders.json'));
};

get '/my-distributions' => sub {
    template 'my-distributions';
};

get '/my-distributions-1' => sub {

    return send_data(path(setting('appdir'), 'public', 'stats', 'my-distributions-1.json'));
};

get '/my-distributions-2' => sub {

    return send_data(path(setting('appdir'), 'public', 'stats', 'my-distributions-2.json'));
};

get '/my-adopted-cpan' => sub {
    template 'my-adopted-cpan';
};

get '/my-adopted-cpan/stat' => sub {

    return send_data(path(setting('appdir'), 'public', 'stats', 'my-adopted-cpan.json'));
};

get '/my-pullrequest' => sub {
    template 'my-pullrequest';
};

get '/my-pullrequest/stat' => sub {

    return send_data(path(setting('appdir'), 'public', 'stats', 'my-pullrequest.json'));
};

get '/my-prc/stat' => sub {

    return send_data(path(setting('appdir'), 'public', 'stats', 'my-prc.json'));
};

get '/my-gitcommits' => sub {
    template 'my-gitcommits';
};

get '/my-gitcommits/2014-16' => sub {

    return send_data(path(setting('appdir'), 'public', 'stats', 'my-gitcommits.json'));
};

get '/my-job' => sub {
    template 'my-job';
};

get '/my-activities' => sub {
    template 'my-activities';
};

get '/my-latest-news' => sub {
    template 'my-latest-news';
};

#
#
# LOCAL METHODS

sub send_data {
    my ($path) = @_;

    content_type 'application/json';
    return read_file_content($path);
}

1;
