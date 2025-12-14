import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@navikt/aksel-icons";
import {
  Button,
  DatePicker,
  HStack,
  Label,
  Popover,
  VStack,
  useDatepicker,
} from "@navikt/ds-react";
import dayjs from "dayjs";
import { useRef, useState } from "react";
import { useSearchParams } from "~/lib/useSearchParams";

function CustomPeriodInputs({
  onApply,
}: {
  onApply: (from: Date, to: Date) => void;
}) {
  const [tempFrom, setTempFrom] = useState<Date | undefined>();
  const [tempTo, setTempTo] = useState<Date | undefined>();

  const { datepickerProps: fromProps, inputProps: fromInputProps } =
    useDatepicker({
      onDateChange: setTempFrom,
      defaultSelected: tempFrom,
    });

  const { datepickerProps: toProps, inputProps: toInputProps } = useDatepicker({
    onDateChange: setTempTo,
    defaultSelected: tempTo,
  });

  return (
    <VStack gap="4">
      <VStack gap="2">
        <Label size="small">Egendefinert periode</Label>
        <DatePicker {...fromProps}>
          <DatePicker.Input {...fromInputProps} label="Fra" size="small" />
        </DatePicker>
        <DatePicker {...toProps}>
          <DatePicker.Input {...toInputProps} label="Til" size="small" />
        </DatePicker>
      </VStack>
      <Button
        size="small"
        variant="primary"
        onClick={() => {
          if (tempFrom && tempTo) {
            onApply(tempFrom, tempTo);
          }
        }}
        disabled={!tempFrom || !tempTo}
      >
        Velg periode
      </Button>
    </VStack>
  );
}

export function PeriodSelector() {
  const { params, setParam } = useSearchParams();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Parse current params
  const currentFrom = params.from ? dayjs(params.from) : undefined;
  const currentTo = params.to ? dayjs(params.to) : undefined;

  const handleApply = (from: Date, to: Date) => {
    setParam("from", dayjs(from).format("YYYY-MM-DD"));
    setParam("to", dayjs(to).format("YYYY-MM-DD"));
    setOpen(false);
  };

  const handlePreset = (days: number | "year" | "today") => {
    const end = dayjs();
    let start = dayjs();

    if (days === "year") {
      start = start.startOf("year");
    } else if (days === "today") {
      start = start.startOf("day");
    } else {
      start = start.subtract(days - 1, "day");
    }

    setParam("from", start.format("YYYY-MM-DD"));
    setParam("to", end.format("YYYY-MM-DD"));
    setOpen(false);
  };

  // Determine label text
  const getLabel = () => {
    if (!currentFrom || !currentTo) return "Velg periode";

    const end = currentTo;
    const start = currentFrom;
    const today = dayjs();
    const isToday = end.isSame(today, "day");

    // Check presets
    if (isToday) {
      if (start.isSame(today, "day")) return "Hittil i dag";

      const diff = end.diff(start, "day") + 1;
      if (diff === 7) return "Siste 7 dager";
      if (diff === 30) return "Siste 30 dager";
      if (diff === 90) return "Siste 3 måneder";
      if (start.isSame(today.startOf("year"), "day")) return "Hittil i år";
    }

    // Custom
    return `${start.format("DD.MM.YYYY")} - ${end.format("DD.MM.YYYY")}`;
  };

  return (
    <>
      <Button
        ref={buttonRef}
        variant="tertiary"
        size="small"
        onClick={() => setOpen(!open)}
        icon={<CalendarIcon aria-hidden />}
        iconPosition="left"
        style={{ border: "1px solid var(--ax-border-neutral-subtle)" }}
      >
        {getLabel()}
        {open ? <ChevronUpIcon aria-hidden /> : <ChevronDownIcon aria-hidden />}
      </Button>

      <Popover
        open={open}
        onClose={() => setOpen(false)}
        anchorEl={buttonRef.current}
        placement="bottom-start"
      >
        <Popover.Content>
          <HStack gap="4" align="start">
            {/* Presets Column */}
            <VStack gap="2" style={{ minWidth: "140px" }}>
              <Label size="small">Hurtigvalg</Label>
              <Button
                variant="tertiary"
                size="small"
                onClick={() => handlePreset("today")}
                className="justify-start"
              >
                Hittil i dag
              </Button>
              <Button
                variant="tertiary"
                size="small"
                onClick={() => handlePreset(7)}
                className="justify-start"
              >
                Siste 7 dager
              </Button>
              <Button
                variant="tertiary"
                size="small"
                onClick={() => handlePreset(30)}
                className="justify-start"
              >
                Siste 30 dager
              </Button>
              <Button
                variant="tertiary"
                size="small"
                onClick={() => handlePreset(90)}
                className="justify-start"
              >
                Siste 3 måneder
              </Button>
              <Button
                variant="tertiary"
                size="small"
                onClick={() => handlePreset("year")}
                className="justify-start"
              >
                Hittil i år
              </Button>
            </VStack>

            {/* Divider */}
            <div
              style={{
                width: "1px",
                backgroundColor: "var(--ax-border-neutral-subtle)",
                alignSelf: "stretch",
              }}
            />

            {/* Custom Range Column */}
            {open && <CustomPeriodInputs onApply={handleApply} />}
          </HStack>
        </Popover.Content>
      </Popover>
    </>
  );
}
