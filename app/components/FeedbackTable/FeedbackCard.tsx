import {
  ChevronDownIcon,
  ChevronUpIcon,
  ShieldLockIcon,
  TrashIcon,
} from "@navikt/aksel-icons";
import {
  BodyShort,
  Button,
  CopyButton,
  Detail,
  HStack,
  Tag,
  Tooltip,
  VStack,
} from "@navikt/ds-react";
import dayjs from "dayjs";
import { DashboardCard } from "~/components/DashboardComponents";
import { useBreakpoint } from "~/hooks/useBreakpoint";
import type { FeedbackDto } from "~/types/api";
import { RenderAnswer } from "../feedback/AnswerRenderer";
import { TimelineView } from "../feedback/TimelineView";
import {
  deviceToIcon,
  getAllRatings,
  getFeedbackPreview,
  getMainTextPreview,
  ratingToEmoji,
} from "../feedback/utils";
import styles from "./FeedbackTable.module.css";

interface FeedbackCardProps {
  feedback: FeedbackDto;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

/**
 * Mobile-optimized card view for a feedback item.
 * Shows compact summary with tap-to-expand functionality.
 * Expanded view uses similar styling to desktop for visual consistency.
 */
export function FeedbackCard({
  feedback,
  isExpanded,
  onToggleExpand,
  onDelete,
  isDeleting,
}: FeedbackCardProps) {
  const ratings = getAllRatings(feedback);
  const preview = getFeedbackPreview(feedback);
  const copyText = getMainTextPreview(feedback) || "";

  // Use timeline view only on larger mobiles (sm breakpoint = 480px+)
  // On very small screens (xs, below 480px), use simple cards to save space
  const { isBelow } = useBreakpoint();
  const showTimeline = !isBelow("sm");

  return (
    <DashboardCard
      padding="4"
      style={{
        cursor: "pointer",
        borderLeft: isExpanded
          ? "3px solid var(--ax-border-action)"
          : undefined,
      }}
      onClick={onToggleExpand}
    >
      <VStack gap="3">
        {/* Header row: Date, Device, App */}
        <HStack justify="space-between" align="center" wrap>
          <HStack gap="2" align="center">
            <Tooltip
              content={dayjs(feedback.submittedAt).format(
                "YYYY-MM-DD HH:mm:ss",
              )}
            >
              <Detail textColor="subtle">
                {dayjs(feedback.submittedAt).format("DD.MM.YY HH:mm")}
              </Detail>
            </Tooltip>
            {feedback.context?.deviceType && (
              <span style={{ fontSize: "0.875rem" }}>
                {deviceToIcon(feedback.context.deviceType)}
              </span>
            )}
          </HStack>
          <Tag variant="neutral" size="small">
            {feedback.app}
          </Tag>
        </HStack>

        {/* Rating emojis */}
        {ratings.length > 0 && (
          <HStack gap="2" align="center">
            {ratings.map((r) => (
              <Tooltip key={r.label} content={r.label}>
                <span className={styles.ratingEmoji}>
                  {ratingToEmoji(r.rating)}
                </span>
              </Tooltip>
            ))}
          </HStack>
        )}

        {/* Preview text (collapsed) */}
        {!isExpanded && preview && (
          <VStack gap="1">
            <BodyShort truncate style={{ fontWeight: 500, maxWidth: "100%" }}>
              {preview.text}
            </BodyShort>
            {preview.subText && (
              <BodyShort
                truncate
                size="small"
                textColor="subtle"
                style={{ maxWidth: "100%" }}
              >
                {preview.subText}
              </BodyShort>
            )}
          </VStack>
        )}

        {/* ===== EXPANDED CONTENT ===== */}
        {isExpanded && (
          <VStack gap="4">
            {/* Section: Svar (Answers) */}
            {feedback.answers && feedback.answers.length > 0 && (
              <div className={styles.expandedSection}>
                <span className={styles.expandedSectionLabel}>
                  Svar ({feedback.answers.length})
                </span>
                {/* Timeline on larger screens, simple cards on small screens */}
                {showTimeline ? (
                  <TimelineView answers={feedback.answers} styles={styles} />
                ) : (
                  <VStack gap="2">
                    {feedback.answers.map((answer) => (
                      <div key={answer.fieldId} className={styles.answerCard}>
                        <RenderAnswer answer={answer} styles={styles} />
                      </div>
                    ))}
                  </VStack>
                )}
              </div>
            )}

            {/* Section: Kontekst (Context) - using contextGrid styling */}
            <div className={styles.expandedSection}>
              <span className={styles.expandedSectionLabel}>Kontekst</span>
              <div className={styles.contextGrid}>
                {/* Survey */}
                <div className={styles.contextItem}>
                  <span className={styles.contextIcon}>📋</span>
                  <div className={styles.contextContent}>
                    <span className={styles.contextLabel}>Survey</span>
                    <span className={styles.contextValue}>
                      {feedback.surveyId}
                    </span>
                  </div>
                </div>

                {/* Timestamp */}
                <div className={styles.contextItem}>
                  <span className={styles.contextIcon}>🕐</span>
                  <div className={styles.contextContent}>
                    <span className={styles.contextLabel}>Tidspunkt</span>
                    <span className={styles.contextValue}>
                      {dayjs(feedback.submittedAt).format("DD. MMM, HH:mm")}
                    </span>
                  </div>
                </div>

                {/* URL/Pathname */}
                {feedback.context?.pathname && (
                  <div className={styles.contextItem}>
                    <span className={styles.contextIcon}>📍</span>
                    <div className={styles.contextContent}>
                      <span className={styles.contextLabel}>Side</span>
                      <span className={styles.contextValue}>
                        {feedback.context.pathname}
                      </span>
                    </div>
                  </div>
                )}

                {/* Device info */}
                {feedback.context?.deviceType && (
                  <div className={styles.contextItem}>
                    <span className={styles.contextIcon}>
                      {deviceToIcon(feedback.context.deviceType)}
                    </span>
                    <div className={styles.contextContent}>
                      <span className={styles.contextLabel}>Enhet</span>
                      <span className={styles.contextValue}>
                        {feedback.context.deviceType}
                        {feedback.context.viewportWidth &&
                          ` (${feedback.context.viewportWidth}×${feedback.context.viewportHeight})`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section: Tags */}
            {feedback.tags && feedback.tags.length > 0 && (
              <div className={styles.expandedSection}>
                <span className={styles.expandedSectionLabel}>🏷️ Tagger</span>
                <HStack gap="2" wrap>
                  {feedback.tags.map((tag) => (
                    <Tag key={tag} variant="neutral" size="small">
                      {tag}
                    </Tag>
                  ))}
                </HStack>
              </div>
            )}

            {/* Section: Metadata */}
            {feedback.metadata && Object.keys(feedback.metadata).length > 0 && (
              <div className={styles.expandedSection}>
                <span className={styles.expandedSectionLabel}>📋 Metadata</span>
                <div className={styles.contextGrid}>
                  {Object.entries(feedback.metadata).map(([key, value]) => (
                    <div key={key} className={styles.contextItem}>
                      <div className={styles.contextContent}>
                        <span className={styles.contextLabel}>{key}</span>
                        <span className={styles.contextValue}>{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sensitive data warning */}
            {feedback.sensitiveDataRedacted && (
              <Tag variant="warning" size="small">
                <ShieldLockIcon aria-hidden /> Sensitive data er redigert bort
              </Tag>
            )}

            {/* IDs Footer */}
            <div className={styles.metadata}>
              <Detail textColor="subtle">ID: {feedback.id}</Detail>
              {feedback.surveyVersion && (
                <Detail textColor="subtle">v{feedback.surveyVersion}</Detail>
              )}
            </div>
          </VStack>
        )}

        {/* Collapsed: Survey ID and tags preview */}
        {!isExpanded && (
          <HStack gap="2" align="center" wrap>
            <Detail textColor="subtle">{feedback.surveyId}</Detail>
            {feedback.tags && feedback.tags.length > 0 && (
              <>
                {feedback.tags.slice(0, 2).map((tag) => (
                  <Tag key={tag} variant="neutral" size="small">
                    {tag}
                  </Tag>
                ))}
                {feedback.tags.length > 2 && (
                  <Detail textColor="subtle">
                    +{feedback.tags.length - 2}
                  </Detail>
                )}
              </>
            )}
            {feedback.sensitiveDataRedacted && (
              <Tag variant="warning" size="small">
                <ShieldLockIcon aria-hidden /> Redigert
              </Tag>
            )}
          </HStack>
        )}

        {/* Action row */}
        <HStack justify="space-between" align="center">
          <Button
            variant="tertiary"
            size="xsmall"
            icon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
          >
            {isExpanded ? "Skjul" : "Vis mer"}
          </Button>

          <HStack gap="1">
            <CopyButton copyText={copyText} size="xsmall" variant="neutral" />
            <Tooltip content="Slett denne tilbakemeldingen">
              <Button
                variant="tertiary-neutral"
                size="xsmall"
                icon={<TrashIcon aria-hidden />}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                loading={isDeleting}
              />
            </Tooltip>
          </HStack>
        </HStack>
      </VStack>
    </DashboardCard>
  );
}
