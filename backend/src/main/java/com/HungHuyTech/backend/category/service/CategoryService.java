package com.HungHuyTech.backend.category.service;

import com.HungHuyTech.backend.category.dto.CategoryRequest;
import com.HungHuyTech.backend.category.dto.CategoryResponse;
import com.HungHuyTech.backend.category.entity.Category;
import com.HungHuyTech.backend.category.repository.CategoryRepository;
import com.HungHuyTech.backend.common.exception.AppException;
import com.HungHuyTech.backend.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    // Lấy danh sách Category dạng cây phân cấp (Cha -> Con)
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllActiveCategoriesTree() {
        List<Category> categories = categoryRepository.findByIsActiveTrueOrderBySortOrderAscIdAsc();
        Map<Long, CategoryResponse> map = new LinkedHashMap<>();
        List<CategoryResponse> roots = new ArrayList<>();

        for (Category cat : categories) {
            map.put(cat.getId(), mapToResponse(cat));
        }

        for (Category cat : categories) {
            CategoryResponse current = map.get(cat.getId());
            if (cat.getParent() != null && map.containsKey(cat.getParent().getId())) {
                map.get(cat.getParent().getId()).getChildren().add(current);
            } else {
                roots.add(current);
            }
        }
        return roots;
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        return mapToResponse(category);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsBySlug(request.getSlug())) {
            throw new AppException(ErrorCode.DUPLICATE_RESOURCE, "Category slug already exists");
        }

        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND, "Parent category not found"));
        }

        Category category = Category.builder()
                .parent(parent)
                .name(request.getName())
                .slug(request.getSlug())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        return mapToResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        if (categoryRepository.existsBySlugAndIdNot(request.getSlug(), id)) {
            throw new AppException(ErrorCode.DUPLICATE_RESOURCE, "Category slug already exists");
        }

        Category parent = null;
        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new AppException(ErrorCode.BAD_REQUEST, "Category cannot be its own parent");
            }
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND, "Parent category not found"));
        }

        category.setParent(parent);
        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        if (request.getSortOrder() != null) category.setSortOrder(request.getSortOrder());
        if (request.getIsActive() != null) category.setIsActive(request.getIsActive());

        return mapToResponse(categoryRepository.save(category));
    }

    // Không xóa category nếu còn danh mục con hoặc còn sản phẩm đang sử dụng (Mục 8 Đặc tả)
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        if (categoryRepository.existsByParentId(id)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Cannot delete category because it has sub-categories");
        }

        if (categoryRepository.countProductsByCategoryId(id) > 0) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Cannot delete category because it contains products");
        }

        categoryRepository.delete(category);
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentName(category.getParent() != null ? category.getParent().getName() : null)
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .sortOrder(category.getSortOrder())
                .isActive(category.getIsActive())
                .children(new ArrayList<>())
                .build();
    }
}