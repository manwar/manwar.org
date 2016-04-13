$(function(){

    $("#form").validate({
        rules: {
            name: {
                required: true,
                minlength: 3
            },
            email: {
                required: true,
                email: true
            },
            subject: {
                required: true
            },
            message: {
                required: true
            }
        },
        messages: {
            name: {
                required: 'This field is required',
                minlength: 'Minimum length: 3'
            },
            email: 'Invalid e-mail address',
            subject: {
                required: 'This field is required',
                minlength: 'Minimum length: 6'
            },
            message: {
                required: 'This field is required'
            }
        },
        success: function(label) {
            label.html('OK').removeClass('error').addClass('ok');
            setTimeout(function(){
                label.fadeOut(500);
            }, 2000)
        }
    });

});