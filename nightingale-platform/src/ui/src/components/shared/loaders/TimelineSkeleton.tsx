import { Skeleton, Box } from "@mui/material";

export const TimelineSkeleton = () => (
  <Box className="flex gap-md p-md mb-sm bg-background border-b border-surface">
    {/* Date/Icon Placeholder */}
    <Skeleton
      variant="circular"
      width={40}
      height={40}
      className="flex-shrink-0"
    />
    <Box className="flex-1">
      {/* Title Placeholder */}
      <Skeleton variant="text" width="60%" height={24} className="mb-xs" />
      {/* Content Placeholder */}
      <Skeleton
        variant="rectangular"
        width="100%"
        height={60}
        className="rounded-md"
      />
      {/* Action Chips */}
      <div className="flex gap-sm mt-sm">
        <Skeleton variant="rounded" width={60} height={24} />
        <Skeleton variant="rounded" width={80} height={24} />
      </div>
    </Box>
  </Box>
);
