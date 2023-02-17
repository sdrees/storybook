export function browserSupportsCssZoom(): boolean {
  try {
    // Checks if safari or firefox is being used.
    // This check can be removed when zoom becomes standard css. Currently firefox does not support it and there is a bug in safari see here:  https://developer.mozilla.org/en-US/docs/Web/CSS/zoom#browser_compatibility
    // regex checks if there are other browsers because "safari" is also present when using chrome or an android browser whilst on mac/iPhone see more here : https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent#which_part_of_the_user_agent_contains_the_information_you_are_looking_for
    const isCompatible = /^((?!chrome|android).)*safari|firefox/i.test(navigator.userAgent);
    return isCompatible;
  } catch (error) {
    return false;
  }
}
