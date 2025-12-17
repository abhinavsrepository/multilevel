package com.realestate.mlm.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TreeNodeResponse {
    private Long userId;
    private String fullName;
    private String status;
    private BigDecimal totalInvestment;
    @JsonProperty("left_child")
    private TreeNodeResponse leftChild;
    @JsonProperty("right_child")
    private TreeNodeResponse rightChild;
    private Integer level;
    private String position;
}
