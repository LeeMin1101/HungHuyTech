package com.HungHuyTech.backend.product.service;

import com.HungHuyTech.backend.brand.entity.Brand;
import com.HungHuyTech.backend.brand.repository.BrandRepository;
import com.HungHuyTech.backend.category.entity.Category;
import com.HungHuyTech.backend.category.repository.CategoryRepository;
import com.HungHuyTech.backend.common.dto.PageResponse;
import com.HungHuyTech.backend.product.dto.AttributeRequest;
import com.HungHuyTech.backend.product.dto.AttributeResponse;
import com.HungHuyTech.backend.product.dto.ProductPublicResponse;
import com.HungHuyTech.backend.product.dto.ProductRequest;
import com.HungHuyTech.backend.product.entity.Product;
import com.HungHuyTech.backend.product.entity.ProductImage;
import com.HungHuyTech.backend.product.entity.ProductVariant;
import com.HungHuyTech.backend.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    // LẤY DANH SÁCH SẢN PHẨM TRANG CHỦ
    public PageResponse<ProductPublicResponse> searchPublicProducts(String keyword, Long categoryId, Long brandId, BigDecimal minPrice, BigDecimal maxPrice, List<Long> attributeValueIds, String sort, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Product> productPage = productRepository.findAll(pageable);
        List<ProductPublicResponse> content = productPage.getContent().stream()
                .map(this::mapToPublicResponse)
                .collect(Collectors.toList());

        return PageResponse.<ProductPublicResponse>builder()
                .content(content)
                .page(productPage.getNumber())
                .size(productPage.getSize())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .build();
    }

    // LẤY CHI TIẾT 1 SẢN PHẨM
    public ProductPublicResponse getProductDetailById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
        return mapToPublicResponse(product);
    }

    // ==========================================
    // CÁC HÀM DÀNH CHO ADMIN
    // ==========================================

    @Transactional
    public ProductPublicResponse createProduct(ProductRequest request) {
        if (request.getCategoryId() == null) {
            throw new RuntimeException("Vui lòng chọn danh mục cho sản phẩm");
        }
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục ID: " + request.getCategoryId()));

        Brand brand = null;
        if (request.getBrandId() != null) {
            brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy hãng ID: " + request.getBrandId()));
        }

        Product product = Product.builder()
                .name(request.getName())
                .category(category)
                .brand(brand)
                .slug(request.getSlug())
                .sku(request.getSku())
                .description(request.getDescription())
                .shortDescription(request.getShortDescription())
                .warrantyMonths(request.getWarrantyMonths() != null ? request.getWarrantyMonths() : 12)
                .isFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .isFlashSale(Boolean.TRUE.equals(request.getIsFlashSale()))
                .flashSaleEnd(Boolean.TRUE.equals(request.getIsFlashSale()) ? request.getFlashSaleEnd() : null)
                .images(new ArrayList<>())
                .variants(new ArrayList<>())
                .build();

        // Map danh sách Variants (Đã bổ sung stock)
        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            for (ProductRequest.VariantRequest vReq : request.getVariants()) {
                ProductVariant variant = ProductVariant.builder()
                        .product(product)
                        .sku(vReq.getSku())
                        .name(vReq.getName())
                        .price(vReq.getPrice())
                        .originalPrice(vReq.getOriginalPrice())
                        .costPrice(vReq.getCostPrice())
                        .barcode(vReq.getBarcode())
                        .weight(vReq.getWeight() != null ? vReq.getWeight() : BigDecimal.ZERO)
                        .stock(vReq.getStock() != null ? vReq.getStock() : 0) // Lưu stock vào entity
                        .isActive(vReq.getIsActive() != null ? vReq.getIsActive() : true)
                        .build();
                product.getVariants().add(variant);
            }
        }

        if (request.getImages() != null && !request.getImages().isEmpty()) {
            for (ProductRequest.ImageRequest iReq : request.getImages()) {
                ProductImage image = ProductImage.builder()
                        .product(product)
                        .imageUrl(iReq.getImageUrl())
                        .sortOrder(iReq.getSortOrder() != null ? iReq.getSortOrder() : 0)
                        .isPrimary(iReq.getIsPrimary() != null ? iReq.getIsPrimary() : false)
                        .build();
                product.getImages().add(image);
            }
        }

        Product savedProduct = productRepository.save(product);
        return mapToPublicResponse(savedProduct);
    }

    @Transactional
    public ProductPublicResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + id));

        if (request.getCategoryId() == null) {
            throw new RuntimeException("Vui lòng chọn danh mục cho sản phẩm");
        }
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục ID: " + request.getCategoryId()));

        Brand brand = null;
        if (request.getBrandId() != null) {
            brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy hãng ID: " + request.getBrandId()));
        }

        product.setName(request.getName());
        product.setCategory(category);
        product.setBrand(brand);
        if (request.getSlug() != null) product.setSlug(request.getSlug());
        product.setShortDescription(request.getShortDescription());
        product.setDescription(request.getDescription());
        product.setIsFlashSale(Boolean.TRUE.equals(request.getIsFlashSale()));
        product.setFlashSaleEnd(Boolean.TRUE.equals(request.getIsFlashSale()) ? request.getFlashSaleEnd() : null);

        // Cập nhật Giá bán và Tồn kho của Variant đầu tiên
        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            ProductRequest.VariantRequest vReq = request.getVariants().get(0);
            if (product.getVariants() != null && !product.getVariants().isEmpty()) {
                ProductVariant existingVariant = product.getVariants().get(0);
                existingVariant.setPrice(vReq.getPrice());
                existingVariant.setStock(vReq.getStock() != null ? vReq.getStock() : 0); // Cập nhật stock khi edit
            } else {
                if (product.getVariants() == null) product.setVariants(new ArrayList<>());
                ProductVariant variant = ProductVariant.builder()
                        .product(product)
                        .sku(vReq.getSku())
                        .name(vReq.getName())
                        .price(vReq.getPrice())
                        .stock(vReq.getStock() != null ? vReq.getStock() : 0) // Tạo mới stock nếu chưa có variant
                        .isActive(true)
                        .build();
                product.getVariants().add(variant);
            }
        }

        if (request.getImages() != null && !request.getImages().isEmpty()) {
            ProductRequest.ImageRequest iReq = request.getImages().get(0);
            if (product.getImages() != null && !product.getImages().isEmpty()) {
                product.getImages().get(0).setImageUrl(iReq.getImageUrl());
            } else {
                if (product.getImages() == null) product.setImages(new ArrayList<>());
                ProductImage image = ProductImage.builder()
                        .product(product).imageUrl(iReq.getImageUrl()).isPrimary(true).sortOrder(1).build();
                product.getImages().add(image);
            }
        }

        Product savedProduct = productRepository.save(product);
        return mapToPublicResponse(savedProduct);
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy sản phẩm để xóa");
        }
        productRepository.deleteById(id);
    }

    public List<AttributeResponse> getAllAttributes() { return null; }

    @Transactional
    public AttributeResponse createAttribute(AttributeRequest request) { return null; }

    // HÀM MAPPER (Chuyển đổi Dữ liệu kèm theo Stock của Variant)
    private ProductPublicResponse mapToPublicResponse(Product product) {
        String primaryImage = product.getImages() != null ? product.getImages().stream()
                .filter(ProductImage::getIsPrimary)
                .findFirst()
                .map(ProductImage::getImageUrl)
                .orElse(!product.getImages().isEmpty() ? product.getImages().get(0).getImageUrl() : null) : null;

        List<ProductVariant> activeVariants = product.getVariants() != null ? product.getVariants().stream()
                .filter(ProductVariant::getIsActive)
                .toList() : new ArrayList<>();

        BigDecimal minPrice = activeVariants.stream()
                .map(ProductVariant::getPrice)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        BigDecimal maxPrice = activeVariants.stream()
                .map(ProductVariant::getPrice)
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        // Map danh sách Variant sang DTO có chứa thông tin stock
        List<ProductPublicResponse.VariantPublicDto> variantDtos = activeVariants.stream()
                .map(variant -> ProductPublicResponse.VariantPublicDto.builder()
                        .id(variant.getId())
                        .sku(variant.getSku())
                        .name(variant.getName())
                        .price(variant.getPrice())
                        .originalPrice(variant.getOriginalPrice())
                        .weight(variant.getWeight())
                        .isActive(variant.getIsActive())
                        .stock(variant.getStock() != null ? variant.getStock() : 0) // Truyền stock ra ngoài
                        .build())
                .collect(Collectors.toList());

        return ProductPublicResponse.builder()
                .id(product.getId())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .brandId(product.getBrand() != null ? product.getBrand().getId() : null)
                .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
                .name(product.getName())
                .slug(product.getSlug())
                .sku(product.getSku())
                .shortDescription(product.getShortDescription())
                .description(product.getDescription())
                .warrantyMonths(product.getWarrantyMonths())
                .isFeatured(product.getIsFeatured())
                .isFlashSale(product.getIsFlashSale())
                .flashSaleEnd(product.getFlashSaleEnd())
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .primaryImageUrl(primaryImage)
                .variants(variantDtos)
                .build();
    }
}