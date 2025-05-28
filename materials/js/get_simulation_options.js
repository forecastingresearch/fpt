export default function get_simulation_options(jsPsych, experiment) {
    const simulation_options = {
        default: {
            data: {
                rt: experiment.settings.SIMULATE_TRIAL_DURATION
            }
        },
        leapfrog_trial_response: {
            data: function () {
                const valid_responses_prop = 0.95
                if (jsPsych.randomization.sampleBernoulli(valid_responses_prop)) {
                    return {rt: experiment.settings.SIMULATE_TRIAL_DURATION}
                } else {
                    return {rt: null, response: null}
                }
            }
        },
        admc_resistance_to_framing: {
            data: function () {
                const valid_responses_prop = 0.95
                if (jsPsych.randomization.sampleBernoulli(valid_responses_prop)) {
                    return {rt: experiment.settings.SIMULATE_TRIAL_DURATION}
                } else {
                    return {rt: null, response: null}
                }
            }
        },
        admc_dr_trial: {
            data: function () {
                const valid_responses_prop = 0.95
                if (jsPsych.randomization.sampleBernoulli(valid_responses_prop)) {
                    return {rt: experiment.settings.SIMULATE_TRIAL_DURATION}
                } else {
                    return {rt: experiment.settings.SIMULATE_TRIAL_DURATION, response: null}
                }
            }
        },
        admc_rp: {
            data: {valid_responses_n: jsPsych.randomization.sampleWithoutReplacement([8, 10], 1)[0], rt: experiment.settings.SIMULATE_TRIAL_DURATION}
        },
        denominator_neglect: {
            data: function () {
                const valid_responses_prop = 0.95
                if (jsPsych.randomization.sampleBernoulli(valid_responses_prop)) {
                    return {rt: experiment.settings.SIMULATE_TRIAL_DURATION}
                } else {
                    return {rt: null, response: null}
                }
            }
        },
        graph_literacy: {
            data: {valid_text_responses_n: jsPsych.randomization.sampleWithoutReplacement([8, 9], 1)[0], 
                    valid_radio_responses_n: jsPsych.randomization.sampleWithoutReplacement([3, 4], 1)[0], 
                    rt: experiment.settings.SIMULATE_TRIAL_DURATION}
        },
        impossible_question: {
            data: {
                valid_responses_prop: 0.95,
                rt: experiment.settings.SIMULATE_TRIAL_DURATION
            }
        },
        time_series: {
            data: function() {
                const valid_responses_prop = 0.50
                if (jsPsych.randomization.sampleBernoulli(valid_responses_prop)) {
                    return {n_points_to_select: 6, rt: experiment.settings.SIMULATE_TRIAL_DURATION}
                } else {
                    return {n_points_to_select: jsPsych.randomization.randomInt(3, 5), rt: experiment.settings.SIMULATE_TRIAL_DURATION}
                }
            }
        },
        raven_matrix: {
            data: function () {
                const valid_responses_prop = 0.05
                if (jsPsych.randomization.sampleBernoulli(valid_responses_prop)) {
                    return {rt: experiment.settings.SIMULATE_TRIAL_DURATION}
                } else {
                    return {rt: experiment.settings.SIMULATE_TRIAL_DURATION, response: {}}
                }
            }
        },
    }
    return simulation_options
}
