var range = $('.range');

range.each(function () {
    var $thumb = $(this).prev('.thumb-container').find('.range-thumb');
    var max = parseInt(this.max, 10);
    var min = parseInt(this.min, 10);
    var tw = 70; // Thumb width. See CSS
    var rangeOne = "";

    $(this).on('input input.range', function () {

        var w = $(this).width();

        var val = parseFloat(this.value);
        var txt = val;

        var xPX = (val - min) * (w - tw) / (max - min);

        var value = ((parseFloat(jQuery(this).val()) - parseFloat(jQuery(this).attr('min'))) / (parseFloat(jQuery(this).attr('max')) - parseFloat(jQuery(this).attr('min')))) * 100;

        if (this.id == 'avgNightlyRentRate') {
            $thumb.attr("data-val", "$" + txt);
        }else if (this.id == 'rentalOccupancyPercentage') {
            $thumb.attr("data-val", txt + "%");
        }
    });
});

function setVal(inputElement){

    rangePercent = ((parseFloat(jQuery(inputElement).val()) / parseFloat(jQuery(inputElement).attr('max'))));

    jQuery('#range_' + jQuery(inputElement).data('id')).val(jQuery(inputElement).val() + '$');

    jQuery('#range_' + jQuery(inputElement).data('id')).css({ 'right': rangePercent + 'px' });

    var value = (parseFloat(jQuery(inputElement).val()) - parseFloat(jQuery(inputElement).attr('min'))) / (parseFloat(jQuery(inputElement).attr('max')) - parseFloat(jQuery(inputElement).attr('min'))) * 100;

    inputElement.style.background = 'linear-gradient(to right, #1D434F 0%, #1D434F ' + value + '%, #f3f3f4 ' + value + '%, #f3f3f4 100%)'

}
setVal(document.getElementById('avgNightlyRentRate'))
setVal(document.getElementById('rentalOccupancyPercentage'))


function calcFun(){
    var avgNightlyRentRate = parseFloat(document.getElementById("avgNightlyRentRate").value) || 0;
    var no_ofDays_ownerWillUseProperty = parseFloat(document.getElementById("no_ofDays_ownerWillUseProperty").value) || 0;
    var rentalOccupancyPercentage = (parseFloat(document.getElementById("rentalOccupancyPercentage").value) / 100) || 0;
    var yearly_CPI_InflationRate = parseFloat(document.getElementById("yearly_CPI_InflationRate").value) || 0;
    var timeHorizonforAnalysis = parseFloat(document.getElementById("timeHorizonforAnalysis").value) || 0;
    var propertyCost = parseFloat(strToNum(document.getElementById("propertyCost").value)|| 0) ;
    var propertyValueAppreciationRate = parseFloat(document.getElementById("propertyValueAppreciationRate").value) || 0;
    
    // PYRI CALC START
    var no_ofDays_ownerNotInProperty_perYear = 365 - no_ofDays_ownerWillUseProperty;
    var pyri = avgNightlyRentRate * 365 * (1 - (no_ofDays_ownerNotInProperty_perYear / 365)) * rentalOccupancyPercentage;

    var appreciatingValueOurRentalIncome = pyri;
    var forSumPYRI = []
    for(let i = 0; i < timeHorizonforAnalysis; i++){
        if(i > 0){
            appreciatingValueOurRentalIncome = appreciatingValueOurRentalIncome * yearly_CPI_InflationRate;
            forSumPYRI.push(appreciatingValueOurRentalIncome)
        }
    }
    var prit = forSumPYRI.reduce((partialSum, a) => partialSum + a, 0);
    
    var ppvot = propertyCost * (Math.pow((1 + propertyValueAppreciationRate), timeHorizonforAnalysis));

    var roi = (((prit + ppvot) - propertyCost) / propertyCost) * 100

    // ROI CALC END

    // RENDER HERE ALL
    document.getElementById("no_ofDays_ownerNotInProperty_perYear").innerHTML = no_ofDays_ownerNotInProperty_perYear;
    document.getElementById("PYRI").innerHTML = valueFormat(pyri, "dollar");
    document.getElementById("PRIT").innerHTML = valueFormat(prit, "dollar");
    document.getElementById("PPVOT").innerHTML = valueFormat(ppvot, "dollar");
    document.getElementById("ROI").innerHTML = valueFormat(roi, "percentage");

    chart = new Highcharts.Chart({
        chart: {
            renderTo: 'container',
            type: 'pie'
        },
        title: {
            text: `${valueFormat(roi, 'percentage')}<br/>ROI`,
            verticalAlign: 'middle',
            y: -25,
            floating: true,
        },
        yAxis: {
            title: {
                text: ''
            }
        },
        plotOptions: {
            pie: {
                shadow: false
            }
        },
        credits: {
            enabled: false
        },
        responsive: {
            rules: [{
              condition: {
                maxWidth: 400
              },
            }]
          },
        exporting: {
            enabled: false
        },
        tooltip: {
            formatter: function () {
                return '<b>' + this.point.name + "</b>: $" + (this.y).toLocaleString('en', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 0,
                })
            }
        },
        series: [{
            name: '',
            data: [{
                name: 'Potential Yearly Rental Income',
                y: pyri,
                color: "#50A5A7"
            }, {
                name: 'Potential Rental Income Over Time',
                y: prit,
                color: "#050F3C"
            }, {
                name: 'Potential Property Value Over Time',
                y: ppvot,
                color: "#1D434F"
            }],
            size: '100%',
            innerSize: '80%',
            showInLegend: true,
            center: ['50%', '50%'],
            dataLabels: {
                enabled: false,
            }
        }]
    });

}
calcFun()


function valueFormat(value, method = "none") {

    if (value == NaN) {
        value = 0
    } else

        if (method == 'dollar') {
            return "$" + value.toLocaleString("en", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            });
        } else if (method == 'percentage') {
            return value.toLocaleString("en", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
            }) + "%";
        } else if (method == 'number') {
            return value.toLocaleString("en", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            });
        }
        else {
            return value.toLocaleString("en", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            });
        }
}


function strToNum(value) {
    var newStr = value.replace(/,/g, '');
    var temp = newStr.replace(/\$/g, '')
    var numberValidation = temp.replace(/\%/g, '')
    return numberValidation || 0
}


jQuery('.percentformat').on('input', function () {

    jQuery(this).val(valueFormat(parseFloat(strToNum(this.value)), 'percentage'))

})
jQuery('.dollarformat').on('change', function () {

    jQuery(this).val(valueFormat(parseFloat(strToNum(this.value)), 'dollar'))

})
jQuery('.numberFormat').on('change', function () {

    jQuery(this).val(valueFormat(parseFloat(strToNum(this.value)), 'number'))

})




