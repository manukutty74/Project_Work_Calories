$(document).ready(function() {

    var ndb;
    var nameInput;
    var showModal = true;

    //graph element
    var myChart;
    Chart.defaults.global.animationSteps = 50;
    Chart.defaults.global.tooltipYPadding = 16;
    Chart.defaults.global.tooltipCornerRadius = 0;
    Chart.defaults.global.tooltipTitleFontStyle = "normal";
    Chart.defaults.global.tooltipFillColor = "rgba(0,160,0,0.8)";
    Chart.defaults.global.animationEasing = "easeOutBounce";
    Chart.defaults.global.responsive = true;
    Chart.defaults.global.scaleLineColor = "black";
    Chart.defaults.global.scaleFontSize = 16;

    //function input search food
    $('#search').keyup(function() {
        $('#result').html('');

        var searchField = $('#search').val();

        if (searchField.length > 3) {
            $.getJSON('https://api.nal.usda.gov/ndb/search/?format=json&q=' + searchField + '&sort=n&max=25&offset=0&api_key=wifP7t9q1wqkljOO3Lm0GGu6OkI2mgA3qLNqIGir', function(data) {

                var response = data.list;
                if (response != undefined) {
                    $.each(response.item, function(key, value) {

                        var str = value.name;
                        var rest = str.substr(0, str.search(", UPC")); //get the string without UPC number

                        $('#result').append('<option data-ndbno="' + value.ndbno + '" value="' + rest + '" ">');

                    });
                }
                if (searchField != "") {
                    $(".nameFood").html(searchField);
                    $('#search').on('input', function() {
                        var value = $(this).val();
                        ndb = $('#result [value="' + value + '"]').data('ndbno');
                        nameInput = value;
                        // console.log(nameInput);
                    });

                }

            })
        }
    });

    //click in the search button 
    $("#btn-search").on('click', function(event) {
        event.preventDefault();
        if (ndb != undefined) {
            var queryURL = "https://api.nal.usda.gov/ndb/nutrients/?format=json&api_key=wifP7t9q1wqkljOO3Lm0GGu6OkI2mgA3qLNqIGir&nutrients=203&nutrients=204&nutrients=208&nutrients=291&nutrients=269&nutrients=205&ndbno=" + ndb;
            $.ajax({
                url: queryURL,
                method: "GET"
            }).then(function(response) {
                console.log(response);
                var resp = response.report.foods["0"].nutrients;

                for (var i = 0; i < resp.length; i++) {
                    var idNutrientes = resp[i].nutrient_id;
                    var valNutrients = resp[i].value;
                    var unid = resp[i].unit;

                    if (idNutrientes == "208") {
                        $("#calories").html(isNumero(valNutrients));
                        $("#calories").append(unid);
                    }
                    if (idNutrientes == "204") {
                        $("#total-fat").html(isNumero(valNutrients));
                        $("#total-fat").append(unid);
                        myChart.data.datasets[0].data[0] = isNumero(valNutrients);
                    }
                    if (idNutrientes == "205") {
                        $("#total-carb").html(isNumero(valNutrients));
                        $("#total-carb").append(unid);
                        myChart.data.datasets[0].data[1] = isNumero(valNutrients);
                    }
                    if (idNutrientes == "269") {
                        $("#sugar").html(isNumero(valNutrients));
                        $("#sugar").append(unid);
                        myChart.data.datasets[0].data[2] = isNumero(valNutrients);
                    }
                    if (idNutrientes == "291") {
                        $("#fiber").html(isNumero(valNutrients));
                        $("#fiber").append(unid);
                        myChart.data.datasets[0].data[3] = isNumero(valNutrients);
                    }
                    if (idNutrientes == "203") {
                        $("#protein").html(isNumero(valNutrients));
                        $("#protein").append(unid);
                        myChart.data.datasets[0].data[4] = isNumero(valNutrients);
                    }
                }
                myChart.update();
                getGiphy(nameInput);
                //  console.log(resp);
            });

        }
    });


    function isNumero(val) {
        var aux;
        if (isNaN(val)) {
            aux = 0;
        } else aux = val;
        return aux;
    }


    //Add the graph element to the canvas
    var ctx = document.getElementById("myChart");
    myChart = new Chart(ctx, {
        type: 'pie',

        data: {
            labels: ["Fat", "Carbohydrates", "Sugar", "Fiber", "Protein"],
            datasets: [{
                data: [1, 1, 1, 1, 1],
                backgroundColor: [
                    'rgba(255, 64, 0,0.4)',
                    'rgba(64, 100, 229,0.4)',
                    'rgba(255, 206, 86,0.4)',
                    'rgba(75, 192, 192,0.4)',
                    'rgba(153, 102, 255,0.4)',

                ],
                borderColor: [
                    'rgba(255,99,132,2)',
                    'rgba(54, 162, 235, 2)',
                    'rgba(255, 206, 86, 2)',
                    'rgba(75, 192, 192, 2)',
                    'rgba(153, 102, 255, 2)',

                ],
                borderWidth: 1
            }]
        },

        options: {
            title: {
                display: true,
                text: 'Nutrient Concentration',
                textAlign: 'left',
                position: 'top'
            },
            legend: {
                display: true,
                position: 'right',
            },
            animation: {
                animation: true,
                animationEasing: 'easeInOutQuart',
                animationSteps: 80,
                animateScale: true
            },
            // responsive: true,
            // maintainAspectRatio: true

        }
    });


    //function giphy
    function getGiphy(nameInput) {
        // buttonVal = $(e).val();
        encVal = encodeURIComponent(nameInput);
        xhr = $.get("https://api.giphy.com/v1/gifs/random?api_key=jEqdCGWOY7yfKVXlHz4wmLGW4OdlMl6C&rating=g&tag=" + encVal);
        xhr.done(function(data) {

            $('#modalThing').prepend("<img class='img-thumbnail img-responsive img-rounded' src='" + data.data.images.fixed_height_still.url + "' />");

            // console.log(data.data.images.fixed_height_still.url);


            //'If no Giphy query found: Show an Alert, Remove Button'
            if (data.data.length == 0) {
                showModal = false;
                $('#modalThing').prepend("Opps, We don't have a ghiphy for you!!! ");
            }
            //'handles the play/stop gif on all images prepended.'
            enable = $('img').click(function() {
                src = $(this).attr("src");

                if (src.indexOf("200_s.gif") > 1) {
                    $(this).attr("src", src.replace(/200_s.gif/i, "200.gif"));
                    //   console.log($(this).attr("src"));
                } else {
                    $(this).attr("src", src.replace(/200.gif/i, "200_s.gif"));
                    //  console.log($(this).attr("src"));
                }
            });
            if (showModal) {
                setTimeout(function() {
                    $('.modal').modal({
                        backdrop: 'static',
                        keyboard: false
                    });
                }, 9000);
            }

        });
    }

    $(".empty").click(function() {
        $("#modalThing").empty();
        $("#search").val("");
    });

});