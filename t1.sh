import "color"
import "date"
import "string@0.2.0"

# Start the daemon
t1_daemon() {
	local cache=
	local sleep_time=0
	local url="https://t1-new.n8.io"
	local api="api/readings?format=shell"
	local cache_dir="$HOME/Library/Caches/io.n8.t1"
	local env_file="$cache_dir/latest.env"
	local headers_file="$cache_dir/latest.headers"
	while sleep "$sleep_time"; do
		mkdir -p "$cache_dir"
		curl -sfLS \
			--netrc-optional \
			--dump-header "$headers_file" \
			"$url/$api" > "$env_file"
		. "$env_file"
		sleep_time="$(expr "$t1_expires" - "$(date_now)")"
		if [ "$sleep_time" -lt 1 ]; then
			# Force a minimum sleep time of 1 second if the data is stale
			sleep_time=1
		fi
		cache="$(grep -i "^x-vercel-cache:" < "$headers_file" | awk -F": " '{print $2}' | tr -d \\r)"
		echo "t1_expires: $t1_expires, sleep_time seconds: $sleep_time, cache: $cache"
		echo "$t1_latest_reading_value"
	done
}

t1_ps1() {
	local trend=
	local color="$GREEN"
	local cache_dir="$HOME/Library/Caches/io.n8.t1"
	local env_file="$cache_dir/latest.env"

	eval "$(sed 's/^/local /' < "$env_file")"
	local bgl="$t1_latest_reading_value"
	local delta="$t1_latest_reading_delta"
	#local mins_ago="$(nightscout_minutes_since "${latest_entry_mills}")"

	if [ "$delta" -ge 0 ]; then
		delta="+$delta"
	fi

	trend="→";

	# If the previous reading was more than 6 minutes ago (5 minutes is
	# normal, plus or minus some time to allow the reading to be uploaded,
	# then the delta is considered questionable so append an asterisk
	#if [ "$((${latest_entry_mills} - ${previous_entry_mills}))" -gt "${SIX_MINUTES_MS}" ]; then
	#	delta="${delta}*"
	#fi

	#if [ "${settings_alarm_timeago_urgent}" = "true" ] && [ "${mins_ago}" -ge "${settings_alarm_timeago_urgent_mins}" ]; then
	#	trend='↛'
	#	color="${INVERSE}${BOLD}${RED}"
	#	bgl="$(echo "${bgl}" | string_strikethrough)"
	#	delta="$(echo "${delta}" | string_strikethrough)"
	#elif [ "${settings_alarm_timeago_warn}" = "true" ] && [ "${mins_ago}" -ge "${settings_alarm_timeago_warn_mins}" ]; then
	#	trend='↛'
	#	color="${INVERSE}${BOLD}${YELLOW}"
	#	bgl="$(echo "${bgl}" | string_strikethrough)"
	#	delta="$(echo "${delta}" | string_strikethrough)"
	#else
	#	case "${latest_entry_direction}" in
	#		DoubleUp) trend="⇈";;
	#		SingleUp) trend="↑";;
	#		FortyFiveUp) trend="↗";;
	#		Flat) trend="→";;
	#		FortyFiveDown) trend="↘";;
	#		SingleDown) trend="↓";;
	#		DoubleDown) trend="⇊";;
	#		NONE) trend="⇼";;
	#	esac

	#	if [ "${latest_entry_mgdl}" -ge "${settings_thresholds_bg_high}" ]; then
	#		color="${BOLD}${YELLOW}"
	#	elif [ "${latest_entry_mgdl}" -ge "${settings_thresholds_bg_target_top}" ]; then
	#		color="${YELLOW}"
	#	elif [ "${latest_entry_mgdl}" -le "${settings_thresholds_bg_low}" ]; then
	#		color="${BOLD}${RED}"
	#	elif [ "${latest_entry_mgdl}" -le "${settings_thresholds_bg_target_bottom}" ]; then
	#		color="${RED}"
	#	fi
	#fi

	if [ "$t1_latest_reading_trend" -eq 8 ]; then
		color="$BOLD$RED"
		bgl="?"
		delta="NC"
		trend="✖︎"
	fi

	printf "\001%s\002%s %s %s\001%s\002" \
		"${color}" "${bgl}" "${delta}" "${trend}" "${NO_COLOR}"
}
