/** 
Google sheet url to the JSON file
The string of the number between sheetURl1 and sheetUrl2 determines the number worksheet to load
into the main DataTable 
Each year of data has its own worksheet, and it is critical to keep the same header names to run smoothly
Because the default worksheet has index 1, index 1 will be the current year and 2019 will be the last index
maxYear variable is going to be using to determine the worksheet index by calculating (maxYear - year + 1)
Ex: maxYear - 2021 + 1 = 2022 - 2021 + 1 = 2
The maxYear number will have to be updated each time a new sheet is added until we automate this
**/

var sheetUrl1 = "https://spreadsheets.google.com/feeds/list/1R8lg8voxZZ9mGaarFjWb8C9bcbEKE_GdE7aJ55ELPkY/"
var sheetUrl2 = "/public/full?alt=json";
var sheetUrl = sheetUrl1 + "1" + sheetUrl2;
var maxYear = 2024;

// Compiles investment name, amount, and GDP growth by formatting them to elements of HTML table row
function addTd (name, data) {
    // Set no investment amount to $0
    if (data[0] == "") data[0] = "$0";
    
    var str = '<tr><td>' + name + '</td>';
    str += '<td style="padding-right:15px; padding-left:15px;">' + data[0] + '</td>';
    str += '<td style="padding-right:15px; padding-left:15px;">' + data[1] + '</td></tr>';
    
    // Return formatted HTML code
    return str;
}

// Compiles general GDP change by formatting it to the elements of an HTML table row
function processPolicy (policy) {
    policy = policy.toString();
    
    // If the cell does not have "0% change" i.e. there was some significant event
    if (!(policy === "0% change")) {
        let growth = policy.slice(0, policy.indexOf("%") + 1).trim();
        let name = policy.slice(policy.indexOf("%")+1, policy.length).trim();
        name = name.replace("(", "").replace(")","");
        
        //Return formatted HTML code
        return "<tr><td padding-right:15px; padding-left:15px;>" + name + "</td><td padding-right:15px; padding-left:15px;>" + growth + "</td></tr>";
    }
    return "";
}

// Format all data related to a country in the form of three data tables
function format ( d ) {
    
    // General data on factors like population, natural growth, and consumer spending
    var genData = '<tr><td>Population</td><td>' + d.gsx$population.$t + '</td></tr><tr><td>Population Growth</td><td>' + d.gsx$populationgrowth.$t + '</td></tr><tr><td>GDP Per Capita</td><td>' + d.gsx$gdppercapita.$t + '</td></tr><tr><td>Natural GDP Growth</td><td>' + d.gsx$npcgrowth.$t + '</td></tr><tr><td>Consumer Spending (% GDP)</td><td>' + d.gsx$consumerspending.$t + '</td></tr>';
    
    // Data on economic events that cannot be easily converted to the investment numbers
    var gdpText = processPolicy(d.gsx$gdpgrowth.$t) + processPolicy(d.gsx$_clrrx.$t) + processPolicy(d.gsx$_cyevm.$t) + processPolicy(d.gsx$_cztg3.$t) + processPolicy(d.gsx$_d180g.$t) + processPolicy(d.gsx$_d2mkx.$t) + processPolicy(d.gsx$_cssly.$t) + processPolicy(d.gsx$_cu76f.$t) + processPolicy(d.gsx$_cvlqs.$t);
    
    // If there were no events, then put a placeholder value for the gdp table
    if (gdpText == "")
    {
        gdpText = '<tr><td colspan=2 >No economic policies to note.</td></tr>'    
    }
    
    // Investment and fiscal stimulus data in table-friendly format
    var fiscalText = addTd('Agriculture', [d.gsx$agricultureinvestment.$t, d.gsx$agriculturereturn.$t]) + addTd('Education', [d.gsx$educationspendingincreasedecrease.$t, d.gsx$educationreturn.$t]) + addTd('Infrastructure', [d.gsx$infrastructureinvestment.$t, d.gsx$infrastructurereturn.$t]) + addTd('Manufacturing', [d.gsx$manufacturinginvestment.$t, d.gsx$manufacturingreturn.$t]) + addTd('Social Spending', [d.gsx$socialspendingincreasedecrease.$t, d.gsx$socialreturn.$t]) + addTd('Research', [d.gsx$researchinvestment.$t, d.gsx$researchreturn.$t])
    
    // Return all data in the form of tables that will be displayed when a country's row is expanded
    // ***Consider using DataTable to format this better with Javascript***
    return `
        <div style="height:100%;">
        <table style="margin: 15px; height:100%; display:inline-block; vertical-align:top; border: 1px solid black;">
            <thead>
                <tr>
                    <th colspan=3 align=center text-align=center >General Data</th>
                </tr>
            </thead>
            <tbody align=center>` + genData + `</tbody>
        </table>
        <table style="margin: 15px; height:100%; display:inline-block; vertical-align:top; border: 1px solid black;">
            <thead>
                <tr>
                    <th colspan=3 align=center text-align=center>Economic Events</th>
                </tr>
                <tr>
                    <th>Policy</th>
                    <th>GDP Growth</th>
                </tr>
            </thead>
            <tbody>` + gdpText + `</tbody>
        </table>
        <table style="margin: 15px; height:100%; display:inline-block; vertical-align:top; border: 1px solid black;">
            <thead>
                <tr>
                    <th colspan=3 align=center >Investments</th>
                </tr>
                <tr>
                    <th style="padding-right:15px; padding-left:15px;">Category</th>
                    <th style="padding-right:15px; padding-left:15px;">Amount</th>
                    <th style="padding-right:15px; padding-left:15px;">GDP Growth</th>
                </tr>
            </thead>
            <tbody align=center>` + fiscalText + `</tbody>
        </table></div>`;
}
    
// As soon as the webpage loads
$(document).ready(function () {
    
    // Create a DataTable object that formats the large table using JSON data from the google sheet url above
    var table = $('#overview_table').DataTable({
        "bServerSide":false,
        paging: false,
        keys: true,
        "bProcessing":true,
        "sAjaxDataProp": "feed.entry",
        "sAjaxSource": sheetUrl,
        "aoColumns": [
            { 
                "sClass":      'details-control',
                "bSortable":      false,
                "mData":          null,
                "sDefaultContent": ''
            },
            { 'mDataProp': 'gsx$country.$t' },
            { 'mDataProp': 'gsx$isocode.$t' },
            { 'mDataProp': 'gsx$gdp.$t' },
            { 'mDataProp': 'gsx$revenuetogdp.$t' },
            { 'mDataProp': 'gsx$budget.$t' },
            { 'mDataProp': 'gsx$totalgdpgrowth.$t' }
        ]
    });
    
    // When the plus or minus icon is clicked, expose child data tables
    $('#overview_table tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );
 
        if ( row.child.isShown() ) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            // Open this row and pass to format function defined above
            row.child( format(row.data()) ).show();
            tr.addClass('shown');
        }
    });
    
    // When the selector value changes, reload the DataTable to reflect data of the year selected
    $(document).on('change', '#year_choice',function () {
        // Refer to the comment at the very beginning to understand the calculation here
        sheetUrl = sheetUrl1 + (maxYear - document.getElementById("year_choice").value + 1).toString() + sheetUrl2;
        
        // Reload data of the appropriate worksheet
        table.ajax.url(sheetUrl).load();
    });
});
