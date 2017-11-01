var canvas;
var stage;

var population = 100;
var boids = new Array();
var boid_radius = 75;
var cohesion_factor = 0.35;
var separation_factor = 0.35;
var alignment_factor = 0.15;

class Boid {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.heading = new Vector((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2);

        this.shape = new createjs.Shape()
        this.shape.graphics.beginFill("lightgrey").drawCircle(0, 0, 3);

        this.shape.x = this.x;
        this.shape.y = this.y;

        stage.addChild(this.shape);
    }

    update() {

        // Get local flockmates
        // A) Steer to avoid local flockmates
        // B) Steer towards the average heading of local flockmates
        // C) Steer to move towards the average position of flockmates

        let flockmates = new Array();

        boids.forEach((boid) => {
            if (boid == this) {
                return;
            }
            if (pythagorean(this.x, this.y, boid.x, boid.y) < boid_radius) {
                flockmates.push(boid);
            }
        });

        if (flockmates.length == 0) {
            this.updatePosition(this.x + this.heading.x, this.y + this.heading.y);
            return;
        }

        // A
        let separation_vector = new Vector(0, 0);

        flockmates.forEach((flockmate) => {
            if (pythagorean(this.x, this.y, flockmate.x, flockmate.y) < boid_radius / 2) {
                separation_vector.x += flockmate.x - this.x;
                separation_vector.y += flockmate.y - this.y;
            }
        });

        separation_vector.x *= -1;
        separation_vector.y *= -1;
        separation_vector = normalize(separation_vector);
        separation_vector = multiplyVector(separation_vector, separation_factor);

        // B 
        let alignment_vector = new Vector(0, 0);

        flockmates.forEach((flockmate) => {
            alignment_vector.x += flockmate.heading.x;
            alignment_vector.y += flockmate.heading.y;
        });

        alignment_vector.x /= flockmates.length;
        alignment_vector.y /= flockmates.length;
        alignment_vector = normalize(alignment_vector);
        alignment_vector = multiplyVector(alignment_vector, alignment_factor);

        // C
        let cohesion_vector = new Vector(0, 0);

        flockmates.forEach((flockmate) => {
            cohesion_vector.x += flockmate.x;
            cohesion_vector.y += flockmate.y;
        });

        cohesion_vector.x /= flockmates.length;
        cohesion_vector.y /= flockmates.length;
        cohesion_vector.x -= this.x;
        cohesion_vector.y -= this.y;
        cohesion_vector = normalize(cohesion_vector);
        cohesion_vector = multiplyVector(cohesion_vector, cohesion_factor)

        // Simple summation of all weighted vectors (and the original heading to give a sense of momentum)
        let random_heading = new Vector((Math.random() - 0.5) * 1, (Math.random() - 0.5) * 1);

        let new_x_heading = separation_vector.x + alignment_vector.x + cohesion_vector.x + this.heading.x + random_heading.x;
        new_x_heading = clamp(new_x_heading, -1, 1);

        let new_y_heading = separation_vector.y + alignment_vector.y + cohesion_vector.y + this.heading.y + random_heading.y;
        new_y_heading = clamp(new_y_heading, -1, 1);

        this.heading = new Vector(new_x_heading, new_y_heading);


        this.updatePosition(this.x + this.heading.x, this.y + this.heading.y);
    }

    updatePosition(x, y) {
        if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
            boids = boids.filter((boid) => {
                return boid != this;
            });
            stage.removeChild(this.shape);
            return;
        }
        this.x = x;
        this.y = y;
        this.shape.x = x;
        this.shape.y = y;

    }
}

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

$(document).ready(function () {
    $.get({
        url: '/github',
        success: function (data, status, jqXHR) {
            var repos_to_display = getMostRecent(data);
            repos_to_display.forEach((repo) => {
                $('#repository-table').find('tbody').append(generateTableRow(repo.name, repo.language, repo.html_url));
            });
        }
    });

    initCanvas();

    $("#contact-button").click(() => {
        location.href = 'mailto:ajrmiles@gmail.com'
    });
    $("#linkedin-button").click(() => {
        redirect('https://www.linkedin.com/in/alistair-miles');
    });
    $("#github-button").click(() => {
        redirect('https://www.github.com/Alistair401');
    });
});

function generateTableRow(name, language, url) {
    if (name.length > 18) {
        name = name.slice(0, 18) + '...';
    }
    var result = `<tr onclick='redirect("${url}");'>`;
    result += `<td>${name}</td>`;
    result += `<td>${language}</td>`;
    result += '</tr>';
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

function redirect(url) {
    window.open(url, '_blank');
}

function initCanvas() {
    canvas = $("#background")[0];
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stage = new createjs.Stage("background");
    createjs.Ticker.addEventListener("tick", handleTick);
}

function handleTick() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (boids.length < population && Math.random() < 0.035) {
        createBoid();
    }

    boids.forEach((boid) => {
        boid.update();
    });

    stage.update();
}

function createBoid() {
    boids.push(new Boid(Math.random() * canvas.width, Math.random() * canvas.height))
}

function pythagorean(x1, y1, x2, y2) {
    let x_distance = x2 - x1;
    let y_distance = y2 - y1;
    return Math.sqrt(Math.pow(x_distance, 2) + Math.pow(y_distance, 2));
}

function normalize(v) {
    let abs = magnitude(v);
    if (abs == 0) {
        return v;
    }
    return new Vector(v.x / abs, v.y / abs);
}

function multiplyVector(v, x) {
    return new Vector(v.x * x, v.y * x)
}

function magnitude(v) {
    let abs = Math.pow(v.x, 2) + Math.pow(v.y, 2);
    if (abs == 0) {
        return 0;
    }
    return Math.sqrt(abs);
}

function clamp(x, min, max) {
    return Math.max(Math.min(x, max), min);
}
