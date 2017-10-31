$(document).ready(function () {
    $.get({
        url: '/github',
        success: function (data, status, jqXHR) {
            repos_to_display = getMostRecent(data);
            repos_to_display.forEach((repo) => {
                $('#repository-table').find('tbody').append(generateTableRow(repo.name, repo.language, repo.description))
            });
        }
    });
    $("#contact-button").click(() => {
        location.href = 'mailto:ajrmiles@gmail.com'
    });
    $("#linkedin-button").click(() => {
        location.href = 'https://www.linkedin.com/in/alistair-miles'
    });
});

function generateTableRow(name, language, description) {
    if (name.length > 18) {
        name = name.slice(0, 18) + '...';
    }
    var result = '<tr>'
    result += `<td>${name}</td>`
    result += `<td>${language}</td>`
    result += `<td class="description"><button>Description</button></td>`
    result += '</tr>'
    return result;
}

function getMostRecent(data) {
    return mergeSort(data).slice(0, 10);
}

function mergeSort(arr) {
    if (arr.length <= 1) {
        return arr;
    }
    var split_index = Math.floor(arr.length / 2);
    var left = arr.slice(0, split_index);
    var right = arr.slice(split_index, arr.length);
    return merge(mergeSort(left), mergeSort(right));
}

function merge(a, b) {
    var result = new Array();
    a_index = 0;
    b_index = 0;
    while (a_index < a.length && b_index < b.length) {
        if (compareRepoDates(a[a_index], b[b_index]) <= 0) {
            result.push(a[a_index]);
            a_index++;
        } else {
            result.push(b[b_index]);
            b_index++;
        }
    }
    while (a_index < a.length) {
        result.push(a[a_index]);
        a_index++;
    }
    while (b_index < b.length) {
        result.push(b[b_index]);
        b_index++;
    }
    return result;
}

function compareRepoDates(a, b) {
    a_date = Date.parse(a.pushed_at);
    b_date = Date.parse(b.pushed_at);
    return b_date - a_date;
}
