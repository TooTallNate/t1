import "color"
import "date@0.0.1"
import "string@0.2.0"

t1_cache_dir="$(import_cache_dir io.n8.t1)"

t1_ps1() {
	local trend=
	local seconds_ago=
	local timeago_warn_seconds=
	local timeago_alarm_seconds=
	local color="$COLOR_GREEN"
	local env_file="$t1_cache_dir/latest.env"

	eval "$(sed 's/^/local /' < "$env_file")"
	local bgl="$t1_latest_reading_value"

	if [ -z "$bgl" ]; then
		echo "${COLOR_RED}Error:${COLOR_RESET} Could not load t1 env vars at \"$env_file\"." >&2
		echo "Please ensure the \`t1d\` service is running." >&2
		return
	fi

	local delta="$t1_latest_reading_delta"
	seconds_ago="$(expr "$(date_now)" - "$t1_latest_reading_date")"

	# TODO: make configurable
	local timeago_warn_mins="15"
	local timeago_alarm_mins="30"
	local value_high_warn="180"
	local value_high_alarm="230"
	local value_low_warn="70"
	local value_low_alarm="55"

	timeago_warn_seconds="$(expr "$timeago_warn_mins" \* 60)"
	timeago_alarm_seconds="$(expr "$timeago_alarm_mins" \* 60)"

	if [ "$delta" -ge 0 ]; then
		delta="+$delta"
	fi

	# Append an asterisk if the previous reading was more than 6 minutes ago
	# (5 minutes is normal, plus or minus some time to allow the reading to
	# be uploaded, in which case the delta is considered "stale"
	if [ "$t1_latest_reading_delay" -ge 360 ]; then
		delta="$delta*"
	fi

	if [ "$seconds_ago" -ge "$timeago_alarm_seconds" ]; then
		trend='↛'
		color="$COLOR_BOLD$COLOR_RED"
		bgl="$(printf "%s" "${bgl}" | string_strikethrough)"
		delta="$(printf "%s" "${delta}" | string_strikethrough)"
	elif [ "$seconds_ago" -ge "$timeago_warn_seconds" ]; then
		trend='↛'
		color="$COLOR_BOLD$COLOR_YELLOW"
		bgl="$(echo "${bgl}" | string_strikethrough)"
		delta="$(echo "${delta}" | string_strikethrough)"
	else
		case "$t1_latest_reading_trend" in
			0) trend="⇼";; # None
			1) trend="⇈";; # DoubleUp
			2) trend="↑";; # SingleUp
			3) trend="↗";; # FortyFiveUp
			4) trend="→";; # Flat
			5) trend="↘";; # FortyFiveDown
			6) trend="↓";; # SingleDown
			7) trend="⇊";; # DoubleDown
			#8)            # NotComputable
			#9)            # OutOfRange
		esac

		if [ "$t1_latest_reading_value" -ge "$value_high_alarm" ]; then
			color="$COLOR_BOLD$COLOR_YELLOW"
		elif [ "$t1_latest_reading_value" -ge "$value_high_warn" ]; then
			color="$COLOR_YELLOW"
		elif [ "$t1_latest_reading_value" -le "$value_low_alarm" ]; then
			color="$COLOR_BOLD$COLOR_RED"
		elif [ "$t1_latest_reading_value" -le "$value_low_warn" ]; then
			color="$COLOR_RED"
		fi
	fi

	if [ "$t1_latest_reading_trend" -eq 8 ]; then
		color="$COLOR_BOLD$COLOR_RED"
		bgl="?"
		delta="NC"
		trend="✖︎"
	fi

	printf "\001%s\002%s %s %s\001%s\002" \
		"$color" "$bgl" "$delta" "$trend" "$COLOR_RESET"
}
