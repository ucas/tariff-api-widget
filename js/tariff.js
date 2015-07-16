/**
 * Tariff calculator skeleton example.
 */
(function($) {

  // Initialise our jQuery plugin
  $.fn.tariffLookup = function(options) {
    return new $.tariffLookup(this, options);
  };

  // The main lookup object.
  $.tariffLookup = function(element, options) {
    var base = this;
    var qualification;
    var grades;
    var results;
    var totals;
    var select;
    var disclaimer;

    base.total = 0;
    base.element = element;

    // Extend the options passed via the initialisation call with some sensible defaults.
    var settings = $.extend({
      // These are the defaults.
      domain: 'https://www.ucas.com/',
      disclaimer: 'Remember the UCAS Tariff calculator is an indicative guide only. Not all universities and colleges use the Tariff.' +
        ' It is therefore really important that you check individual university and college requirements.' +
        ' Please ensure you read the key facts on the Tariff web page.'
    }, options);

    // Main initialisation
    base.init = function(element) {
      // Add a standard class
      element.addClass('tariff-container');

      element.empty();

      // Insert a heading.
      $('<h2>').text('UCAS tariff points calculator').appendTo(element);

      // Insert our main qualification selection then populate it from the API.
      element.append('<p>Select qualification dropdown list to reveal its grade and tariff point values</p>');
      select = $('<select>').appendTo(element);
      var option = $('<option>').attr('value', '_none').text('Please select a qualification..');
      select.append(option);
      base.getQualifications(select);

      // Insert an empty container for grades to populate.
      grades = $('<div>').appendTo(element).addClass('grades');

      // Insert empty container for results and hide until its needed.
      results = $('<div>').appendTo(element).addClass('results').css('display', 'none');
      results.append('<div class="grade-row header"><span class="qualification">Qualification</span><span class="grades">Grades</span><span class="points">Points</span></div>');

      // Insert empty totals container.
      totals = $('<div>').appendTo(element).addClass('totals').css('display', 'none');

      // Insert a reset
      $('<a>').appendTo(element).addClass('reset').text('Reset').click(function() {
        base.reset();
      });

      // Insert disclaimer text.
      disclaimer = $('<div>').appendTo(element).addClass('disclaimer').append('<h4>Disclaimer</h4>').append('<p>' + settings.disclaimer + '</p>');

      // Create a logo
      var logo = $('<img>').appendTo(element);
      logo.attr("src", settings.domain + "sites/all/themes/ucas/logo.png").addClass('logo');

      // Enable our event handler.
      select.change(function() {
        if (this.value == '_none') {
          grades.empty();
        }
        else {
          qualification = $('option:selected', $(this)).text();
          base.getGrades(this.value);
        }
      });
    };

    // Fetch a list of qualifications and populate a select element.
    base.getQualifications = function(target) {
      $.getJSON(settings.domain + "api/tariff/v1/list", function(result){
        $.each(result, function(i, field){
          var option = $('<option>').attr('value', i).text(field);
          var str = option.text();
          option.html(str).text();
          target.append(option);
        });
      });
    };

    // Based on a qualification ID, return a list of possible grades.
    base.getGrades = function(code) {
      grades.empty();
      grades.append('<div class="grade-row header"><span class="grades">Grades</span><span class="points">Points</span><span></span></div>');
      var url = settings.domain + "api/tariff/v1/view/" + code;
      $.getJSON(url, function(result) {
        $.each(result, function(grade, points){
          var row = $('<div>').appendTo(grades).addClass('grade-row');
          $('<span>').appendTo(row).addClass('grades').text(grade);
          $('<span>').appendTo(row).addClass('points').text(points);
          var add = $('<span>').appendTo(row).addClass('add');
          $('<a>').appendTo(add).text('Add').click(function() {
            base.addGrade(grade, points);
          });
        });
      });
    };

    base.addGrade = function(grade, points) {
      results.css('display', 'table');
      var row = $('<div>').appendTo(results).addClass('result-row').addClass('result');
      $('<span>').appendTo(row).addClass('qualification').text(qualification);
      $('<span>').appendTo(row).addClass('grades').text(grade);
      $('<span>').appendTo(row).addClass('points').text(points);
      grades.empty();
      $(select).val('_none');
      base.updateTotal(points);
    };

    base.updateTotal = function(points) {
      totals.css('display', 'block');
      base.total = base.total + parseInt(points);
      totals.text('Total: ' + base.total);
    };

    base.reset = function() {
      $(select).val('_none');
      grades.empty();
      results.css('display', 'none');
      results.find('.result').remove();
      totals.empty();
      base.total = 0;
    };

    // Initialise the plugin.
    base.init(element);
  }

})(jQuery);

