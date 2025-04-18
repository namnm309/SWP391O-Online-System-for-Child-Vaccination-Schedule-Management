package com.example.SpringBootTurialVip.enums;

public enum AgeGroup {
    AGE_0_3("0-3 tháng", 0, 3),
    AGE_4_6("4-6 tháng", 4, 6),
    AGE_7_12("7-12 tháng", 7, 12),
    AGE_13_24("13-24 tháng", 13, 24),
    AGE_25_PLUS("25 tháng trở lên", 25, Integer.MAX_VALUE),
    AGE_ALL("Phù hợp cho mọi độ tuổi", 0, Integer.MAX_VALUE);  // Thêm nhóm tuổi cho mọi độ tuổi

    private final String label;

    private final int minMonth;

    private final int maxMonth;

    AgeGroup(String label, int minMonth, int maxMonth) {
        this.label = label;
        this.minMonth = minMonth;
        this.maxMonth = maxMonth;
    }

    public String getLabel() {
        return label;
    }

    public int getMinMonth() {
        return minMonth;
    }

    public int getMaxMonth() {
        return maxMonth;
    }

    public static AgeGroup fromRange(int minAge, int maxAge) {
        // Kiểm tra nếu phạm vi là phù hợp cho mọi độ tuổi
        if (minAge == 0 && maxAge == Integer.MAX_VALUE) {
            return AGE_ALL;  // Trả về AGE_ALL cho mọi độ tuổi
        }

        for (AgeGroup group : values()) {
            // Kiểm tra sự giao nhau giữa phạm vi minAge-maxAge với phạm vi của từng nhóm tuổi
            if (minAge <= group.maxMonth && maxAge >= group.minMonth) {
                return group;  // Trả về nhóm nếu có giao nhau
            }
        }
        return AGE_25_PLUS;  // Trả về AGE_25_PLUS nếu không tìm thấy nhóm tuổi phù hợp
    }




}