$u = _.noConflict();

/**
 * @description Transforms a provided string by replacing all occurrences of `+` with
 * spaces, and then decodes any URI-encoded components.
 * 
 * @param {string} x - string that is to be decoded and with + replaced with space
 * 
 * @returns {string} a string that has had any plus signs (`+`) replaced with spaces.
 */
jQuery.urldecode = function(x) {
  return decodeURIComponent(x).replace(/\+/g, ' ');
};

jQuery.urlencode = encodeURIComponent;

/**
 * @description Extracts key-value pairs from a search query string and stores them
 * in an object.
 * 
 * @param {string} s - URL search part, which is used to extract and group parameters
 * based on their values.
 * 
 * @returns {object} a dictionary containing key-value pairs of URL parameters.
 */
jQuery.getQueryParameters = function(s) {
  if (typeof s === 'undefined')
    s = document.location.search;
  var parts = s.substr(s.indexOf('?') + 1).split('&');
  var result = {};
  for (var i = 0; i < parts.length; i++) {
    var tmp = parts[i].split('=', 2);
    var key = jQuery.urldecode(tmp[0]);
    var value = jQuery.urldecode(tmp[1]);
    if (key in result)
      result[key].push(value);
    else
      result[key] = [value];
  }
  return result;
};

/**
 * @description Highlights text within a node and adds a class to it if the given
 * `text` is found within the node's value. It also creates a rectangular shape (SVG
 * for SVG nodes) and adds a class to it, pushing it to an array of objects containing
 * the parent node and target element for later insertion.
 * 
 * @param {string} text - keyword or phrase that is used to identify which text within
 * the element to highlight.
 * 
 * @param {string} className - class name of the highlighted text, and it is used to
 * append the appropriate CSS class name to the newly created highlight span element
 * or rectangle in SVG, depending on the output format.
 * 
 * @returns {object} a list of DOM elements with the specified `className` class added
 * to their parent node.
 */
jQuery.fn.highlightText = function(text, className) {
  /**
   * @description Adds a highlight effect to a specified node or its child nodes if
   * they match certain criteria, inserting a Span or SVG element with the same class
   * as the original element.
   * 
   * @param {"HTMLElement"} node - element for which highlighting should be applied.
   * 
   * 	* `nodeType`: This is a property that indicates the node type of the input `node`.
   * It can take on the following values:
   * 		+ 1: Element
   * 		+ 2: Character
   * 		+ 3: Text
   * 		+ 4: Comment
   * 		+ 5: Procedure
   * 		+ 6: Entity Ref
   * 		+ 7: String
   * 		+ 8: Math Error
   * 		+ 9: Normal Substitution
   * 		+ 10: Token
   * 	* `val`: This is a property that represents the value of the input `node`. It is
   * a string.
   * 	* `text`: This is an property that represents the text content of the input `node`.
   * It is a string.
   * 	* `pos`: This is a property that represents the index of the target text in the
   * original text. It is an integer.
   * 	* `className`: This is a property that represents the class attribute of the input
   * `node`. It is a string.
   * 	* `isInSVG`: This is a property that indicates whether the input `node` is inside
   * an SVG element or not. It is a boolean value (true if inside SVG, false otherwise).
   * 
   * 	The function then processes the input `node` based on its type and child nodes,
   * adding highlighted elements to an array `addItems`.
   * 
   * @param {object} addItems - 2D bounding box coordinates of a new rectangle that
   * will be appended to the element's parent node, with the specified class name added
   * for styling purposes.
   */
  function highlight(node, addItems) {
    if (node.nodeType === 3) {
      var val = node.nodeValue;
      var pos = val.toLowerCase().indexOf(text);
      if (pos >= 0 &&
          !jQuery(node.parentNode).hasClass(className) &&
          !jQuery(node.parentNode).hasClass("nohighlight")) {
        var span;
        var isInSVG = jQuery(node).closest("body, svg, foreignObject").is("svg");
        if (isInSVG) {
          span = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
        } else {
          span = document.createElement("span");
          span.className = className;
        }
        span.appendChild(document.createTextNode(val.substr(pos, text.length)));
        node.parentNode.insertBefore(span, node.parentNode.insertBefore(
          document.createTextNode(val.substr(pos + text.length)),
          node.nextSibling));
        node.nodeValue = val.substr(0, pos);
        if (isInSVG) {
          var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          var bbox = node.parentElement.getBBox();
          rect.x.baseVal.value = bbox.x;
          rect.y.baseVal.value = bbox.y;
          rect.width.baseVal.value = bbox.width;
          rect.height.baseVal.value = bbox.height;
          rect.setAttribute('class', className);
          addItems.push({
              "parent": node.parentNode,
              "target": rect});
        }
      }
    }
    else if (!jQuery(node).is("button, select, textarea")) {
      jQuery.each(node.childNodes, function() {
        highlight(this, addItems);
      });
    }
  }
  var addItems = [];
  /**
   * @description Highlights `this` by calling `addItems`.
   */
  var result = this.each(function() {
    highlight(this, addItems);
  });
  for (var i = 0; i < addItems.length; ++i) {
    jQuery(addItems[i].parent).before(addItems[i].target);
  }
  return result;
};

/*
 * backward compatibility for jQuery.browser
 * This will be supported until firefox bug is fixed.
 */
if (!jQuery.browser) {
  /**
   * @description Generates an object containing the browser and its version based on
   * a subset of user agents. The function first converts the user agent string to
   * lowercase, then uses regular expressions to extract the browser and version
   * information. If any of the browser-specific patterns match, the function returns
   * an object with `browser` and `version` properties; otherwise, it returns an empty
   * object.
   * 
   * @param {string} ua - user agent string provided to the function, which is converted
   * into an array of browser and version information using regular expressions.
   * 
   * @returns {object} an object with `browser` and `version` properties, each containing
   * the detected browser name and version number, respectively.
   */
  jQuery.uaMatch = function(ua) {
    ua = ua.toLowerCase();

    var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
      /(webkit)[ \/]([\w.]+)/.exec(ua) ||
      /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
      /(msie) ([\w.]+)/.exec(ua) ||
      ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
      [];

    return {
      browser: match[ 1 ] || "",
      version: match[ 2 ] || "0"
    };
  };
  jQuery.browser = {};
  jQuery.browser[jQuery.uaMatch(navigator.userAgent).browser] = true;
}

/**
 * Small JavaScript module for the documentation.
 */
var Documentation = {

  /**
   * @description Performs the following actions: fix Firefox anchor bug, highlight
   * search words, initialize index table, and initialize on-key listeners (if Navigation
   * with Keys is enabled).
   */
  init : function() {
    this.fixFirefoxAnchorBug();
    this.highlightSearchWords();
    this.initIndexTable();
    if (DOCUMENTATION_OPTIONS.NAVIGATION_WITH_KEYS) {
      this.initOnKeyListeners();
    }
  },

  /**
   * i18n support
   */
  TRANSLATIONS : {},
  PLURAL_EXPR : function(n) { return n === 1 ? 0 : 1; },
  LOCALE : 'unknown',

  // gettext and ngettext don't access this so that the functions
  // can safely bound to a different name (_ = Documentation.gettext)
  /**
   * @description Translates a given string from one language to another, using pre-defined
   * translation mappings in an object called `Documentation.TRANSLATIONS`.
   * 
   * @param {string} string - code for which high-quality documentation is to be generated.
   * 
   * @returns {string} the translated string from the `TRANSLATIONS` cache, or the
   * original string if no translation exists.
   */
  gettext : function(string) {
    var translated = Documentation.TRANSLATIONS[string];
    if (typeof translated === 'undefined')
      return string;
    return (typeof translated === 'string') ? translated : translated[0];
  },

  /**
   * @description Takes a singular and plural term, as well as an integer `n`, and
   * returns the appropriate translation from a set of predefined translations.
   * 
   * @param {string} singular - singular form of a word or phrase, which is used to
   * generate the documentation for that word or phrase.
   * 
   * @param {string} plural - 2nd argument passed to the function and provides an
   * optional value to be used when generating the plural form of a word.
   * 
   * @param {integer} n - number of items, and it is used to determine whether the
   * singular or plural form of the translated word should be returned.
   * 
   * @returns {string} the plural form of a word based on the provided context and number.
   */
  ngettext : function(singular, plural, n) {
    var translated = Documentation.TRANSLATIONS[singular];
    if (typeof translated === 'undefined')
      return (n == 1) ? singular : plural;
    return translated[Documentation.PLURALEXPR(n)];
  },

  /**
   * @description Sets the `TRANSLATIONS` property to the messages in a given catalog
   * and creates a plural expression function using the `plural_expr` property from the
   * catalog. Additionally, it assigns the `LOCALE` property to the value of the
   * `catalog.locale` property.
   * 
   * @param {object} catalog - code documentation that the function generates, providing
   * the messages, plural expression, and locale for translation.
   */
  addTranslations : function(catalog) {
    for (var key in catalog.messages)
      this.TRANSLATIONS[key] = catalog.messages[key];
    this.PLURAL_EXPR = new Function('n', 'return +(' + catalog.plural_expr + ')');
    this.LOCALE = catalog.locale;
  },

  /**
   * @description Adds a header link with a title and an ID attribute linked to each
   * div or dt element on the page, creating a context menu for each heading element.
   */
  addContextElements : function() {
    $('div[id] > :header:first').each(function() {
      $('<a class="headerlink">\u00B6</a>').
      attr('href', '#' + this.id).
      attr('title', _('Permalink to this headline')).
      appendTo(this);
    });
    $('dt[id]').each(function() {
      $('<a class="headerlink">\u00B6</a>').
      attr('href', '#' + this.id).
      attr('title', _('Permalink to this definition')).
      appendTo(this);
    });
  },

  /**
   * @description Modifies the current URL by adding an empty string to the end if there
   * is a hash (#) and the browser is Mozilla. It sets a timeout for the modification
   * using the `setTimeout()` method, allowing for any subsequent URLs to be loaded correctly.
   */
  fixFirefoxAnchorBug : function() {
    if (document.location.hash && $.browser.mozilla)
      window.setTimeout(function() {
        document.location.href += '';
      }, 10);
  },

  /**
   * @description Utilizes the query parameters to highlight search terms within a
   * webpage's body content using JavaScript, and displays a link to hide the search matches.
   */
  highlightSearchWords : function() {
    var params = $.getQueryParameters();
    var terms = (params.highlight) ? params.highlight[0].split(/\s+/) : [];
    if (terms.length) {
      var body = $('div.body');
      if (!body.length) {
        body = $('body');
      }
      window.setTimeout(function() {
        $.each(terms, function() {
          body.highlightText(this.toLowerCase(), 'highlighted');
        });
      }, 10);
      $('<p class="highlight-link"><a href="javascript:Documentation.' +
        'hideSearchWords()">' + _('Hide Search Matches') + '</a></p>')
          .appendTo($('#searchbox'));
    }
  },

  /**
   * @description Uses `$('img.toggler')` to retrieve all the images with a `.toggler`
   * class, and binds an event listener to them that toggle the display of rows in an
   * index table based on their `id`. The function also updates the image sources upon
   * toggle to reflect the state of the row being shown or hidden.
   */
  initIndexTable : function() {
    /**
     * @description Modifies the `src` attribute of an image element based on the last
     * nine characters of its `src` attribute, changing between the string `plus.png` and
     * `minus.png`.
     */
    var togglers = $('img.toggler').click(function() {
      var src = $(this).attr('src');
      var idnum = $(this).attr('id').substr(7);
      $('tr.cg-' + idnum).toggle();
      if (src.substr(-9) === 'minus.png')
        $(this).attr('src', src.substr(0, src.length-9) + 'plus.png');
      else
        $(this).attr('src', src.substr(0, src.length-8) + 'minus.png');
    }).css('display', '');
    if (DOCUMENTATION_OPTIONS.COLLAPSE_INDEX) {
        togglers.click();
    }
  },

  /**
   * @description Fades out an highlighted link and removes the "highlighted" class
   * from any matching elements.
   */
  hideSearchWords : function() {
    $('#searchbox .highlight-link').fadeOut(300);
    $('span.highlighted').removeClass('highlighted');
  },

  /**
   * @description Generates a URL by combining the base URL `/` and a provided relative
   * URL.
   * 
   * @param {string} relativeURL - portion of the URL that is relative to the root URL
   * and must be combined with the URL root to form the full URL.
   * 
   * @returns {string} a full URL for the given relative URL, starting from the URL
   * root directory.
   */
  makeURL : function(relativeURL) {
    return DOCUMENTATION_OPTIONS.URL_ROOT + '/' + relativeURL;
  },

  /**
   * @description Splits the current URL into its parts, removes the base URL, and
   * returns the remaining part of the URL.
   * 
   * @returns {string} the path of the current URL without the URL root.
   */
  getCurrentURL : function() {
    var path = document.location.pathname;
    var parts = path.split(/\//);
    $.each(DOCUMENTATION_OPTIONS.URL_ROOT.split(/\//), function() {
      if (this === '..')
        parts.pop();
    });
    var url = parts.join('/');
    return path.substring(url.lastIndexOf('/') + 1, path.length - 1);
  },

  /**
   * @description Monitors keyboard events on a webpage, navigating to previous or next
   * pages when certain keys are pressed, while ignoring input from search boxes,
   * textareas, dropdowns, buttons, and alt/ctrl/meta keys.
   * 
   * @returns {false` value} a JavaScript code snippet that listens for key presses on
   * the page and navigates to the previous or next page link based on the pressed key.
   * 
   * 	* `activeElementType`: The tag name of the currently active element in the document.
   * 	* `event`: The keyboard event that triggered the function.
   * 	* `keyCode`: The ASCII code of the pressed key.
   * 	* `prevHref`: The URL of the previous link element with a `rel` attribute set to
   * `"prev"`.
   * 	* `nextHref`: The URL of the next link element with a `rel` attribute set to `"next"`.
   */
  initOnKeyListeners: function() {
    $(document).keydown(function(event) {
      var activeElementType = document.activeElement.tagName;
      // don't navigate when in search box, textarea, dropdown or button
      if (activeElementType !== 'TEXTAREA' && activeElementType !== 'INPUT' && activeElementType !== 'SELECT'
          && activeElementType !== 'BUTTON' && !event.altKey && !event.ctrlKey && !event.metaKey
          && !event.shiftKey) {
        switch (event.keyCode) {
          case 37: // left
            var prevHref = $('link[rel="prev"]').prop('href');
            if (prevHref) {
              window.location.href = prevHref;
              return false;
            }
          case 39: // right
            var nextHref = $('link[rel="next"]').prop('href');
            if (nextHref) {
              window.location.href = nextHref;
              return false;
            }
        }
      }
    });
  }
};

// quick alias for translations
_ = Documentation.gettext;

/**
 * @description Initializes the `Documentation` initialization by calling `Documentation.init()`.
 */
$(document).ready(function() {
  Documentation.init();
});
