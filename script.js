var id_counter;

function init() {
	var list,
		addBar;

	id_counter = 0;


	list = loadList();
	if(list) {
		parseList( loadList() );
	}

	addBar = $( makeAddBar() );
	$("#header").append( addBar );
	
	$("#headerAddList").click( function(e) {
		var addBar,
			listAddBars;

		addBar = $( e.currentTarget ).next().next();

		addBar.find(".radioButtonContainer").hide();

		listAddBars = $(".adding");
		listAddBars.parent().prev().slideUp();
		listAddBars.removeClass("adding");

		if( addBar.hasClass("addingHeader") ) {
			$("#headerAddList").removeClass("headerClicked");
			addBar.removeClass("addingHeader");
			addBar.slideUp( 200 );
		} else {
			$("#headerAddList").addClass("headerClicked");
			addBar.addClass("addingHeader");
			addBar.slideDown( 200 );
		}
	} );
	$("#headerClearComplete").click( completedRemoveButtonHandler );
	$("#headerAddList").mouseover( mouseOverHandler );
	$("#headerAddList").mouseout( mouseOutHandler );
	$("#headerClearComplete").mouseover( mouseOverHandler );
	$("#headerClearComplete").mouseout( mouseOutHandler );
}

function addList( listName, destination, checked ) {
	var newList,		// The list we'll be creating
		newItem;		// The item that the list will reside in

	newList = $( document.createElement("ul") );

	// Let addItem take care of the list node
	newItem = addItem( listName, destination, true, checked );
	newItem = $( newItem );
	newItem.addClass("list");

	// Add the new list to the new list node
	newItem.append( newList );

	// Update localStorage
	saveList( scanList() );

	// Make the list sortable
	$("ul").sortable( {
		connectWith: "ul",
		handle: "> h3",
		placeholder: "imaplaceholder",
		stop: function( e, ui ) {
			var sentItem;

			sentItem = $( ui.item );
			sentItem.hide();
			sentItem.slideDown( 200 );

			// Delete items that have been dragged out of the top lists
			if( !sentItem.hasClass("list") ) {
				if( sentItem.parent().filter("#top").length ) {
					sentItem.detach();
				}
			}

			saveList( scanList() );
		}
	} );
	$("ul").disableSelection();

	// Return the list element and remove the jQuery stuff.
	return newItem[ 0 ];
}

function addItem( itemName, destination, skipUpdate, checked ) {
	var newItem,		// The new list node to be appended to destination
		itemHeader,		// The header node contained in the list
		destinationTag,
		toolbar;

	// Create the list item
	newItem = $( document.createElement("li") );

	// Create and attach a h3 to a new list node
	itemHeader = $( document.createElement("h3") );
	itemHeader.css( "padding-left", "1.1em" );

	// Create checkbox for completed items
	checkboxContainer = $( document.createElement("div") );
	checkboxContainer.click( checkboxClickHandler );

	checkboxContainer.css( "width", "1.1em" );
	checkboxContainer.css( "display", "inline-block" );
	checkboxContainer.css( "margin-left", "-1.1em" );
	checkboxContainer.css( "vertical-align", "top" );

	checkbox = $( document.createElement("input") );
	checkbox.attr( "type", "checkbox" );
	if( checked ) {
		checkbox.prop( "checked", true );
		newItem.addClass("checked");
	}

	checkboxContainer.append( checkbox );
	itemHeader.append( checkboxContainer );

	// Attach the text separately
	itemText = $( document.createElement("div") );
	itemText.addClass("itemText");
	itemText.css( "display", "inline-block" );
	itemText.css( "width", "100%" );
	itemText.css( "vertical-align", "middle" );
	itemText.html( itemName );
	itemHeader.append( itemText );

	// Append the header to the list item
	newItem.append( itemHeader );

	// Get proper destination.  If destination is not a list, insert after given dest.
	destinationTag = $( destination ).prop("tagName");
	if( destinationTag === "UL" ) {
		$( destination ).prepend( newItem );
	} else if( $(destination).children("ul").length ) {
		$( destination ).children("ul").prepend( newItem );
	} else if( $(destination).children.length ) {
		newItem.insertAfter( destination );
	} else {
		return 0;
	}

	// Attach toolbar after we're done building the item
	setTimeout( function() {
		toolbar = makeToolbar( newItem[0] );
		newItem.children(":first").after( toolbar );
	}, 0 );

	// Update localStorage
	if( !skipUpdate ) {
		saveList( scanList() );
	}

	// Return the list node without jQuery stuff
	return newItem[ 0 ];
}

function deleteItem( itemDOMNode ) {
	var oldNode;

	// Pull the node out of the DOM, and return it to the user.
	oldNode = $( itemDOMNode ).detach();

	// Update localStorage
	saveList( scanList() );

	return oldNode[ 0 ];
}

function scanList() {
	var parsedDOM,
		scanStack,
		domStack,
		curScan,
		curDOM,
		nextDOM,
		chilren,
		curChild,
		childTag,
		i;

	parsedDOM = {
		"lists" : []
	};

	scanStack = [];
	scanStack.push( parsedDOM.lists );

	domStack = [];
	domStack.push( $("#top") );

	while( domStack.length ) {
		curDOM = domStack.pop();
		curScan = scanStack.pop();
		children = curDOM.children("li");

		for( i=0; i<children.length; i++ ) {
			curChild = children[ i ];
			childTag = $( curChild ).prop( "tagName" );

			curScan[ i ] = {};
			curScan[ i ].header = $( curChild ).children("h3").children(".itemText").html();
			curScan[ i ].checked = $( curChild ).hasClass("checked");

			nextDOM = $( curChild ).children("ul");
			if( nextDOM[0] ) {
				curScan[ i ].list = [];

				domStack.push( nextDOM );
				scanStack.push( curScan[i].list );
			} else {
				curScan[ i ].list = null;
			}

		}
	}

	return parsedDOM;
}

function makeToolbar(item) {
	var close,
		min,
		add,
		toolbar,
		toolbarContainer,
		addBar,
		lineAfter,
		padding;

	toolbarContainer = $( document.createElement("div") );
	toolbarContainer.addClass("toolbarContainer");

	toolbar = $( document.createElement("div") );
	toolbar.addClass("toolbar");

	close = $( document.createElement("span") );
	close.html(" X ");
	close.mousedown( closeClickHandler );
	close.hover( function() {
		$( this ).toggleClass("mouseOver");
	} );
	toolbar.prepend( close );

	if( $(item).hasClass("list") ) {
		min = $( document.createElement("span") );
		min.html(" _ ");
		min.mousedown( minClickHandler );
		min.hover( function() {
			$( this ).toggleClass("mouseOver");
		} );
		toolbar.prepend( min );
		
		add = $( document.createElement("span") );
		add.html(" + ");
		add.mousedown( addClickHandler );
		add.hover( function() {
			$( this ).toggleClass("mouseOver");
		} );
		toolbar.prepend( add );

		// Make toolbar for adding items to a list
		addBar = makeAddBar();
		toolbarContainer.append( addBar );
	}

	padding = $( document.createElement("div") );
	padding.css( "display", "inline-block" );
	toolbar.prepend( padding );

	padding = $( document.createElement("div") );
	padding.css( "display", "inline-block" );
	toolbar.append( padding );

	lineAfter = $( document.createElement("div") );
	lineAfter.html("");
	lineAfter.css( "display", "inline-block" );
	lineAfter.css( "width", "100%" );
	toolbar.append( lineAfter );
	toolbarContainer.append( toolbar );

	return toolbarContainer[ 0 ];
}

function makeAddBar() {
	var addBar,
		addBarForm,
		addBarTextInput,
		addBarRadioButtonContainer,
		addBarRadioButtonItem,
		addBarRadioButtonList;

	addBar = $( document.createElement("div") );
	addBar.addClass("addBar");
	addBar.hide();

	addBarForm = $( document.createElement("form") );
	addBarForm.attr( "action", "javascript:addBarHandler()" );

	addBarTextInput = $( document.createElement("input") );
	addBarTextInput.attr( "type", "text" );
	addBarTextInput.css( "width", "100%" );
	addBarForm.append( addBarTextInput );

	addBarRadioButtonContainer = $( document.createElement("div") );
	addBarRadioButtonContainer.addClass("radioButtonContainer");
	addBarRadioButtonItem = $( document.createElement("input") );
	addBarRadioButtonItem.attr( "type", "radio" );
	addBarRadioButtonItem.attr( "name", "itemType" );
	addBarRadioButtonItem.attr( "value", "item" );
	addBarRadioButtonItem.prop( "checked", true );
	addBarRadioButtonList = $( document.createElement("input") );
	addBarRadioButtonList.attr( "type", "radio" );
	addBarRadioButtonList.attr( "name", "itemType" );
	addBarRadioButtonList.attr( "value", "list" );
	addBarRadioButtonContainer.append( addBarRadioButtonItem );
	addBarRadioButtonContainer.append( "Item" );
	addBarRadioButtonContainer.append( addBarRadioButtonList );
	addBarRadioButtonContainer.append( "List" );

	addBarForm.append( addBarRadioButtonContainer );
	addBar.append( addBarForm );

	return addBar[ 0 ];
}

function parseList(list) {
	var domFinal,
		scanStack,
		domStack,
		curScan,
		curDOM,
		nextDOM,
		nextChild,
		curHeading,
		i;

	domFinal = $( document.createElement("ul") );

	scanStack = [];
	scanStack.push( list.lists );

	domStack = [];
	domStack.push( $("#top") );

	while( scanStack.length ) {
		curDOM = domStack.pop();
		curScan = scanStack.pop();

		for( i=curScan.length-1; i>=0; i-- ) {
			if( curScan[i].list ) {
				nextDOM = addList( curScan[i].header, curDOM, curScan[i].checked );

				domStack.push( nextDOM );
				scanStack.push( curScan[i].list );
			} else {
				addItem( curScan[i].header, curDOM, false, curScan[i].checked );
			}
		}
	}
}

function saveList(list) {
	localStorage.list = JSON.stringify( list );
}

function loadList() {
	if( localStorage.list ) {
		return JSON.parse( localStorage.list );
	}

	return 0;
}


function liClickHandler(e) {
	var selected,
		deselected;

	selected = $( e.currentTarget );

	deselected = $(".selected");
	deselected.removeClass("selected");

	selected.addClass("selected");
	selected.children(".toolbar").slideDown(200);

	deselected = deselected.filter(":not(.selected):not(.list)");
	deselected.children(".toolbar").slideUp(200);

	e.stopPropagation();
}

function topClickHandler(e){
	var selected;

	selected = $(".selected")

	selected.removeClass("selected");

	selected = selected.filter(":not(.selected):not(.list)");

	selected.children(".toolbar").slideUp(200);

	$("li").unbind( "mousedown", sendClickHandler );
}

function closeClickHandler(e) {
	var itemDOMNode;

	itemDOMNode = $( e.currentTarget ).parent().parent().parent()[ 0 ];
	$( itemDOMNode ).slideUp( 200, function() {
		deleteItem( itemDOMNode );
	} );
}

function addClickHandler(e) {
	var addBar,
		addButton,
		curAdding,
		curAddingAddBar;

	addButton = $( e.currentTarget );
	curAdding = $(".adding");

	addButton.addClass("adding");

	curAdding.removeClass("adding");

	curAddingAddBar = curAdding.parent().prev();
	curAddingAddBar.slideUp( 200 );

	$(".headerClicked").removeClass("headerClicked");
	$("#header>.addBar").removeClass("addingHeader");
	$("#header>.addBar").slideUp( 200 );

	addBar = $(".adding").parent().prev();
	addBar.slideDown( 200, function() {
		addBar.find(":text").focus();
	} );
}

function checkboxClickHandler(e) {
	var boxContainer,
		listItem;

	boxContainer = $( e.currentTarget );
	listItem = boxContainer.parent().parent();

	listItem.toggleClass("checked");

	saveList( scanList() );
}

function minClickHandler(e) {
	var itemDOMNode,
		minButton,
		header;

	itemDOMNode = $( e.currentTarget ).parent().parent().parent().children("ul");
	minButton = $( e.currentTarget );
	header = minButton.parent().parent().parent().children("h3");

	itemDOMNode.slideToggle( 200 );

	header.toggleClass("minClicked");
	minButton.toggleClass("minClicked");
}


function deleteItemHeaderHandler(e) {
	var itemDOMNode;

	itemDOMNode = $( e.target ).parent()[ 0 ];
	deleteItem( itemDOMNode );
}

function completedRemoveButtonHandler(e) {
	var completed;

	completed = $(".checked");

	completed.slideUp( 200, function() {
		completed.detach();
		saveList( scanList() );
	} );
}

function addBarHandler() {
	var adding,
		form,
		text,
		radio,
		destination,
		newItem;

	if( !!$(".addingHeader").length ) {
		text = $(".addingHeader").find(":text");
		newItem = addList( text.val(), $("#top")[0], false );
	} else {
		adding = $(".adding");
		form = adding.parent().prev().find("form");
		destination = adding.parent().parent().parent();

		radio = form.find(":radio:checked");
		text = form.find(":text");

		if( radio.val() == "list" ) {
			newItem = addList( text.val(), destination, false );
		} else {
			newItem = addItem( text.val(), destination );
		}
	}

	text.val("");

	$( newItem ).hide();
	$( newItem ).slideDown( 200 );
}

function mouseOverHandler(e) {
	$( e.currentTarget ).addClass("mouseOver");
}
function mouseOutHandler(e) {
	$( e.currentTarget ).removeClass("mouseOver");
}