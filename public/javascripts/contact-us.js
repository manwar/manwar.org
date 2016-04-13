$(document).ready(function(){
    /* after the page has finished loading */

    $('#contact-form').jqTransform();
    /* transform the form using the jqtransform plugin */

    $("button").click(function(){
         $(".formError").hide();
         /* hide all the error tooltips */
    });

    var use_ajax=true;
    $.validationEngine.settings={};
    /* initialize the settings object for the formValidation plugin */

    $("#contact-form").validationEngine({ /* create the form validation */
        inlineValidation: false,
        promptPosition: "centerRight",
        success : function(){use_ajax=true},  /* if everything is OK enable AJAX */
        failure : function(){use_ajax=false}  /* in case of validation failure disable AJAX */
    })

    $("#contact-form").submit(function(e){

        if(!$('#subject').val().length)
        {
            $.validationEngine.buildPrompt(".jqTransformSelectWrapper","* This field is required","error")
            /* a custom validation tooltip, using the buildPrompt method */
             return false;
        }

       $("#contact-form").hide('slow').after('<h1>Thank you!</h1>');
       /* show the confirmation message */

        e.preventDefault(); /* stop the default form submit */
    })
});
