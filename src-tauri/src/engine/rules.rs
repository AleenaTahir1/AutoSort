use crate::config::schema::{Condition, SortRule};
use regex::Regex;
use std::path::Path;

pub fn match_file<'a>(path: &Path, rules: &'a [SortRule]) -> Option<&'a SortRule> {
    let file_name = path.file_name()?.to_str()?;
    let extension = path.extension()?.to_str()?.to_lowercase();
    let file_size = path.metadata().ok().map(|m| m.len()).unwrap_or(0);
    
    // Sort rules by priority (higher first)
    let mut sorted_rules: Vec<&SortRule> = rules.iter().filter(|r| r.enabled).collect();
    sorted_rules.sort_by(|a, b| b.priority.cmp(&a.priority));
    
    for rule in sorted_rules {
        if matches_rule(file_name, &extension, file_size, rule) {
            return Some(rule);
        }
    }
    
    None
}

fn matches_rule(file_name: &str, extension: &str, file_size: u64, rule: &SortRule) -> bool {
    // All conditions must match (AND logic)
    for condition in &rule.conditions {
        if !matches_condition(file_name, extension, file_size, condition) {
            return false;
        }
    }
    
    // At least one condition must exist
    !rule.conditions.is_empty()
}

fn matches_condition(file_name: &str, extension: &str, file_size: u64, condition: &Condition) -> bool {
    match condition {
        Condition::Extension(extensions) => {
            extensions.iter().any(|ext| ext.to_lowercase() == extension)
        }
        Condition::NameContains(pattern) => {
            file_name.to_lowercase().contains(&pattern.to_lowercase())
        }
        Condition::NameRegex(pattern) => {
            Regex::new(pattern)
                .map(|re| re.is_match(file_name))
                .unwrap_or(false)
        }
        Condition::SizeGreaterThan(size) => file_size > *size,
        Condition::SizeLessThan(size) => file_size < *size,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::schema::default_rules;
    
    #[test]
    fn test_match_image() {
        let rules = default_rules();
        let path = Path::new("/downloads/photo.jpg");
        let matched = match_file(path, &rules);
        assert!(matched.is_some());
        assert_eq!(matched.unwrap().name, "Images");
    }
    
    #[test]
    fn test_match_document() {
        let rules = default_rules();
        let path = Path::new("/downloads/report.pdf");
        let matched = match_file(path, &rules);
        assert!(matched.is_some());
        assert_eq!(matched.unwrap().name, "Documents");
    }
}
