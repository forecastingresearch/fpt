function format_time_for_display(time_in_s) {
    let minutes = Math.floor(time_in_s / 60)
    let seconds = time_in_s % 60
    if (seconds < 10) {
        seconds = `0${seconds}`
    }
    return `${minutes}:${seconds}`
}

function parse_time_from_display(html) {
    let minutes = parseInt(html.split(":")[0])
    let seconds = parseInt(html.split(":")[1])
    return minutes*60 + seconds
}

function disable_required(trial_name) {
    if (["survey-html-form", "survey-multi-choice"].includes(trial_name)) {
        document.querySelectorAll("input").forEach(e => {e.required = false});
    }
}

function get_submit_btn(trial_name) {
    let selector = "input[type='submit']";
    if (trial_name === "html-slider-response") {
        selector = "#jspsych-html-slider-response-next";
    } else if (trial_name === "survey-multi-select") {
        selector = "#jspsych-survey-multi-select-next";
    }
    return document.querySelector(selector);
}

export function start_timer(jsPsych) {
    let current_trial = jsPsych.getCurrentTrial()

    document.getElementById('global-instructions-timer-container').style.visibility = "visible"
    let timer_el = document.getElementById('global-timer-value')
    timer_el.innerHTML = format_time_for_display(current_trial.timer)
    const increment_ms = 1000
    let interval_id = setInterval(function() {
        let curr_time_remaining_s = parse_time_from_display(timer_el.innerHTML)
        timer_el.innerHTML = format_time_for_display(curr_time_remaining_s - (increment_ms/1000))
        if (curr_time_remaining_s < 1) {
            current_trial.data.custom_timer_ended_trial = true;
            
            clearInterval(interval_id);
            
            const special_trial_names = ["survey-html-form", "survey-multi-choice", "html-slider-response", "survey-multi-select", "survey-text"]
            let trial_name = current_trial.type.info.name;
            disable_required(trial_name);
            if (special_trial_names.includes(trial_name)) {
                let submit_btn = get_submit_btn(trial_name);
                submit_btn.disabled = false;
                jsPsych.pluginAPI.clickTarget(submit_btn);
            } else {
                jsPsych.pluginAPI.cancelAllKeyboardResponses();
                if (["html-button-response", "html-keyboard-response"].includes(trial_name)) {
                    jsPsych.finishTrial({stimulus: current_trial.stimulus})
                } else {
                    jsPsych.finishTrial();
                }
            }
        }
    }, increment_ms)
    return interval_id
}

export function end_timer(interval_id) {
    document.getElementById('global-instructions-timer-container').style.visibility = "hidden"
    clearInterval(interval_id)
}