$(function() {
   /* global Handlebars, panthrLang, $ */
   var webConsole, outputTemplate;

   webConsole = panthrLang.Console.web();

   outputTemplate = Handlebars.compile($('#output-template').html());

   function processInput() {
      var html;

      webConsole.evalAndUpdate($('#input').val());
      console.log(webConsole.lastResult);

      html = outputTemplate(webConsole.lastResult);

      $(html).hide().appendTo($('#results')).fadeIn(500);
      $('#input').val('').focus();
   }

   $('#execute').on('click', processInput);
   $('#input').focus();
});
