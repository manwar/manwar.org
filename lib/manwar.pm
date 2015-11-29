package manwar;

use strict; use warnings;
use Data::Dumper;
use JSON;
use Dancer2;
use Dancer2::FileUtils qw(path read_file_content);

=head1 NAME

Dancer2 App - manwar.org

=head1 VERSION

Version 0.06

=head1 AUTHOR

Mohammad S Anwar, C<< <mohammad.anwar at yahoo.com> >>

=cut

$manwar::VERSION   = '0.06';
$manwar::AUTHORITY = 'cpan:MANWAR';

get '/' => sub {
    template 'cpan-uploaders';
};

get '/cpan-regulars' => sub {
    template 'stats';
};

get '/stats/monthly' => sub {

    my $file = Dancer2::FileUtils::path(setting('appdir'), 'public', 'stats', 'monthly.json');
    my $data = Dancer2::FileUtils::read_file_content($file);
    my $stat = JSON->new->decode($data);

    content_type 'application/json';
    return to_json($stat);
};

get '/stats/weekly' => sub {

    my $file = Dancer2::FileUtils::path(setting('appdir'), 'public', 'stats', 'weekly.json');
    my $data = Dancer2::FileUtils::read_file_content($file);
    my $stat = JSON->new->decode($data);

    content_type 'application/json';
    return to_json($stat);
};

get '/stats/daily' => sub {

    my $file = Dancer2::FileUtils::path(setting('appdir'), 'public', 'stats', 'daily.json');
    my $data = Dancer2::FileUtils::read_file_content($file);
    my $stat = JSON->new->decode($data);

   content_type 'application/json';
   return to_json($stat);
};

get '/cpan-uploaders' => sub {
    template 'cpan-uploaders';
};

get '/cpan-uploaders/20' => sub {

    my $file = Dancer2::FileUtils::path(setting('appdir'), 'public', 'stats', 'cpan-uploaders.json');
    my $data = Dancer2::FileUtils::read_file_content($file);
    my $stat = JSON->new->decode($data);

   content_type 'application/json';
   return to_json($stat);
};

get '/neocpan-uploaders' => sub {
    template 'neocpan-uploaders';
};

get '/neocpan-uploaders/50' => sub {

    my $file = Dancer2::FileUtils::path(setting('appdir'), 'public', 'stats', 'neocpan-uploaders.json');
    my $data = Dancer2::FileUtils::read_file_content($file);
    my $stat = JSON->new->decode($data);

   content_type 'application/json';
   return to_json($stat);
};

get '/cpant-kwalitee' => sub {
    template 'cpant-kwalitee';
};

get '/cpant-kwalitee/100' => sub {

    my $file = Dancer2::FileUtils::path(setting('appdir'), 'public', 'stats', 'cpant-kwalitee.json');
    my $data = Dancer2::FileUtils::read_file_content($file);
    my $stat = JSON->new->decode($data);

   content_type 'application/json';
   return to_json($stat);
};

get '/my-cpan' => sub {
    template 'my-cpan';
};

get '/my-cpan/stat' => sub {

    my $file = Dancer2::FileUtils::path(setting('appdir'), 'public', 'stats', 'my-cpan.json');
    my $data = Dancer2::FileUtils::read_file_content($file);
    my $stat = JSON->new->decode($data);

    content_type 'application/json';
    return to_json($stat);
};

get '/my-pullrequest' => sub {
    template 'my-pullrequest';
};

get '/my-pullrequest/2015' => sub {

    my $file = Dancer2::FileUtils::path(setting('appdir'), 'public', 'stats', 'my-pullrequest.json');
    my $data = Dancer2::FileUtils::read_file_content($file);
    my $stat = JSON->new->decode($data);

    content_type 'application/json';
    return to_json($stat);
};

get '/my-gitcommits' => sub {
    template 'my-gitcommits';
};

get '/my-gitcommits/2014-15' => sub {

    my $file = Dancer2::FileUtils::path(setting('appdir'), 'public', 'stats', 'my-gitcommits.json');
    my $data = Dancer2::FileUtils::read_file_content($file);
    my $stat = JSON->new->decode($data);

    content_type 'application/json';
    return to_json($stat);
};

get '/my-job' => sub {
    template 'my-job';
};

1;
